"""
Browser Manager Service - Core Playwright orchestration with memory optimization.
"""
import asyncio
import base64
import ipaddress
import time
from typing import Optional, Union
from urllib.parse import urlparse
from contextlib import asynccontextmanager

import structlog
from playwright.async_api import (
    async_playwright,
    Browser,
    BrowserContext,
    Page,
    Playwright,
    Error as PlaywrightError,
    TimeoutError as PlaywrightTimeoutError,
)

from ..models.schemas import ActionType, BrowseRequest, BrowseResponse, ProxyConfig

logger = structlog.get_logger()

# Constants
MAX_CONCURRENT_BROWSERS = 3  # Memory constraint: ~1-1.5GB per browser
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
)
DEFAULT_VIEWPORT = {"width": 1920, "height": 1080}
DEFAULT_TIMEOUT = 30000  # 30 seconds

# Anti-detection scripts
STEALTH_SCRIPTS = [
    # Hide webdriver flag
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});",
    # Mock plugins
    "Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});",
    # Mock languages
    "Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});",
    # Hide Chrome automation flag
    "window.chrome = {runtime: {}};",
    # Mock permissions
    """
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
    );
    """,
]


class SSRFProtection:
    """SSRF protection - block internal IPs."""
    
    BLOCKED_IPS = {
        "127.0.0.0/8",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16",
        "0.0.0.0/8",
        "169.254.0.0/16",
        "224.0.0.0/4",
        "240.0.0.0/4",
    }
    
    BLOCKED_HOSTNAMES = {
        "localhost",
        "localhost.localdomain",
        "ip6-localhost",
        "ip6-loopback",
        "metadata.google.internal",  # GCP metadata
        "metadata",  # Azure metadata
        "169.254.169.254",  # Cloud metadata IP
    }
    
    @classmethod
    def is_blocked(cls, url: str) -> tuple[bool, str]:
        """Check if URL points to a blocked internal address."""
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname or parsed.netloc.split(':')[0]
            
            # Check blocked hostnames
            if hostname.lower() in cls.BLOCKED_HOSTNAMES:
                return True, f"Hostname '{hostname}' is blocked"
            
            # Resolve and check IP
            try:
                import socket
                ip_str = socket.gethostbyname(hostname)
                ip = ipaddress.ip_address(ip_str)
                
                for cidr in cls.BLOCKED_IPS:
                    if ip in ipaddress.ip_network(cidr):
                        return True, f"IP '{ip_str}' is in blocked range"
            except socket.gaierror:
                # DNS resolution failed, might be invalid domain
                pass
            except ValueError:
                pass
            
            return False, ""
        except Exception as e:
            return True, f"URL validation error: {str(e)}"


class BrowserManager:
    """
    Singleton browser manager with resource pooling.
    Uses semaphore for concurrency control and maintains
    a single browser instance with multiple contexts.
    """
    
    _instance: Optional["BrowserManager"] = None
    _lock: asyncio.Lock = asyncio.Lock()
    _semaphore: asyncio.Semaphore = asyncio.Semaphore(MAX_CONCURRENT_BROWSERS)
    
    def __new__(cls) -> "BrowserManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None
        self._active_contexts: int = 0
        self._start_time: float = time.time()
        self._metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_response_time": 0.0,
        }
    
    @property
    def active_contexts(self) -> int:
        return self._active_contexts
    
    @property
    def available_slots(self) -> int:
        return MAX_CONCURRENT_BROWSERS - self._active_contexts
    
    @property
    def uptime(self) -> float:
        return time.time() - self._start_time
    
    @property
    def metrics(self) -> dict:
        return {
            **self._metrics,
            "average_response_time_ms": (
                self._metrics["total_response_time"] / self._metrics["total_requests"]
                if self._metrics["total_requests"] > 0 else 0
            ),
            "active_contexts": self._active_contexts,
            "queued_requests": MAX_CONCURRENT_BROWSERS - self._semaphore._value,
        }
    
    async def initialize(self) -> None:
        """Initialize the browser instance."""
        async with self._lock:
            if self._playwright is None:
                logger.info("Initializing Playwright...")
                self._playwright = await async_playwright().start()
                
            if self._browser is None or not self._browser.is_connected():
                logger.info("Launching Chromium browser...")
                self._browser = await self._playwright.chromium.launch(
                    headless=True,
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-web-security",
                        "--disable-features=IsolateOrigins,site-per-process",
                        f"--user-agent={DEFAULT_USER_AGENT}",
                    ],
                )
                logger.info("Browser launched successfully")
    
    async def shutdown(self) -> None:
        """Shutdown browser and cleanup resources."""
        async with self._lock:
            if self._browser:
                logger.info("Closing browser...")
                await self._browser.close()
                self._browser = None
            
            if self._playwright:
                logger.info("Stopping Playwright...")
                await self._playwright.stop()
                self._playwright = None
    
    def _get_proxy_settings(self, proxy_config: Optional[ProxyConfig]) -> Optional[dict]:
        """Convert ProxyConfig to Playwright proxy settings."""
        if not proxy_config:
            return None
        
        proxy_settings = {"server": proxy_config.server}
        if proxy_config.username and proxy_config.password:
            proxy_settings["username"] = proxy_config.username
            proxy_settings["password"] = proxy_config.password
        
        return proxy_settings
    
    @asynccontextmanager
    async def create_context(
        self,
        request: BrowseRequest,
    ):
        """
        Create an isolated browser context (incognito-like).
        Ensures proper cleanup even on errors.
        """
        context: Optional[BrowserContext] = None
        page: Optional[Page] = None
        
        async with self._semaphore:
            self._active_contexts += 1
            start_time = time.time()
            
            try:
                await self.initialize()
                
                # Build context options
                context_options = {
                    "viewport": {
                        "width": request.viewport_width,
                        "height": request.viewport_height,
                    },
                    "user_agent": request.user_agent or DEFAULT_USER_AGENT,
                    "ignore_https_errors": True,
                    "java_script_enabled": True,
                    "bypass_csp": True,
                }
                
                # Add proxy if configured
                proxy_settings = self._get_proxy_settings(request.proxy_config)
                if proxy_settings:
                    context_options["proxy"] = proxy_settings
                
                # Add custom headers
                if request.headers:
                    context_options["extra_http_headers"] = request.headers
                
                # Create isolated context
                context = await self._browser.new_context(**context_options)
                
                # Inject anti-detection scripts
                for script in STEALTH_SCRIPTS:
                    await context.add_init_script(script)
                
                # Create new page
                page = await context.new_page()
                page.set_default_timeout(request.timeout)
                
                yield page
                
            finally:
                # Cleanup: always close page and context
                if page and not page.is_closed():
                    try:
                        await page.close()
                    except Exception as e:
                        logger.warning(f"Error closing page: {e}")
                
                if context:
                    try:
                        await context.close()
                    except Exception as e:
                        logger.warning(f"Error closing context: {e}")
                
                self._active_contexts -= 1
                self._metrics["total_requests"] += 1
                self._metrics["total_response_time"] += (time.time() - start_time) * 1000
    
    async def browse(self, request: BrowseRequest) -> BrowseResponse:
        """
        Execute browser navigation and content extraction.
        """
        start_time = time.time()
        
        # SSRF Protection
        is_blocked, reason = SSRFProtection.is_blocked(request.url)
        if is_blocked:
            logger.warning(f"SSRF attempt blocked: {reason}")
            raise ValueError(f"URL blocked: {reason}")
        
        async with self.create_context(request) as page:
            try:
                # Navigate to URL
                logger.info(f"Navigating to: {request.url}")
                
                response = await page.goto(
                    request.url,
                    wait_until="domcontentloaded",
                    timeout=request.timeout,
                )
                
                if not response:
                    raise PlaywrightError("No response received from navigation")
                
                # Wait for specific element or time
                if request.wait_for:
                    await self._wait_for(page, request.wait_for, request.timeout)
                
                # Execute custom JavaScript
                if request.execute_js:
                    logger.debug(f"Executing custom JS: {request.execute_js[:50]}...")
                    await page.evaluate(request.execute_js)
                
                # Extract content based on action
                content = None
                screenshot = None
                pdf = None
                
                if request.action == ActionType.RENDER:
                    content = await page.content()
                
                elif request.action == ActionType.SCREENSHOT:
                    screenshot_bytes = await page.screenshot(
                        full_page=request.full_page,
                        type="png",
                    )
                    screenshot = base64.b64encode(screenshot_bytes).decode("utf-8")
                
                elif request.action == ActionType.PDF:
                    pdf_bytes = await page.pdf(
                        format="A4",
                        print_background=True,
                        margin={
                            "top": "1cm",
                            "right": "1cm",
                            "bottom": "1cm",
                            "left": "1cm",
                        },
                    )
                    pdf = base64.b64encode(pdf_bytes).decode("utf-8")
                
                # Get page metadata
                final_url = page.url
                page_title = await page.title()
                
                self._metrics["successful_requests"] += 1
                
                return BrowseResponse(
                    status="success",
                    url=request.url,
                    final_url=final_url if final_url != request.url else None,
                    content=content,
                    screenshot=screenshot,
                    pdf=pdf,
                    content_type=response.headers.get("content-type"),
                    page_title=page_title,
                    execution_time_ms=(time.time() - start_time) * 1000,
                )
                
            except PlaywrightTimeoutError as e:
                self._metrics["failed_requests"] += 1
                logger.error(f"Timeout error for {request.url}: {e}")
                raise TimeoutError(f"Page load timeout: {str(e)}")
            
            except PlaywrightError as e:
                self._metrics["failed_requests"] += 1
                logger.error(f"Playwright error for {request.url}: {e}")
                raise ConnectionError(f"Navigation failed: {str(e)}")
    
    async def _wait_for(
        self,
        page: Page,
        wait_for: Union[str, int],
        timeout: int,
    ) -> None:
        """Handle wait_for parameter (selector or time)."""
        if isinstance(wait_for, int):
            # Wait for specific time in milliseconds
            await page.wait_for_timeout(wait_for)
        else:
            # Wait for CSS selector
            try:
                await page.wait_for_selector(wait_for, timeout=timeout)
            except PlaywrightTimeoutError:
                logger.warning(f"Selector '{wait_for}' not found within timeout")


# Global browser manager instance
browser_manager = BrowserManager()
