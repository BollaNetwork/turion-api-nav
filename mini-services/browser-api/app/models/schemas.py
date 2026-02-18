"""
Pydantic models for request/response validation.
"""
from enum import Enum
from typing import Any, Optional, Union
from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator
import re


class ActionType(str, Enum):
    """Available browser action types."""
    RENDER = "render"
    SCREENSHOT = "screenshot"
    PDF = "pdf"


class ProxyConfig(BaseModel):
    """Proxy configuration for routing traffic."""
    server: str = Field(..., description="Proxy server address (e.g., 'http://proxy.example.com:8080')")
    username: Optional[str] = Field(None, description="Proxy username for authentication")
    password: Optional[str] = Field(None, description="Proxy password for authentication")

    @field_validator('server')
    @classmethod
    def validate_server(cls, v: str) -> str:
        if not v.startswith(('http://', 'https://', 'socks5://')):
            raise ValueError('Proxy server must start with http://, https://, or socks5://')
        return v


class BrowseRequest(BaseModel):
    """Request model for browse endpoint."""
    url: str = Field(..., description="Target URL to navigate to")
    action: ActionType = Field(
        default=ActionType.RENDER,
        description="Action to perform: render (HTML), screenshot (base64), or pdf"
    )
    wait_for: Optional[Union[str, int]] = Field(
        default=None,
        description="CSS selector to wait for, or time in milliseconds"
    )
    execute_js: Optional[str] = Field(
        default=None,
        description="JavaScript code to execute before capture"
    )
    proxy_config: Optional[ProxyConfig] = Field(
        default=None,
        description="Optional proxy configuration"
    )
    timeout: int = Field(
        default=30000,
        ge=1000,
        le=60000,
        description="Request timeout in milliseconds (1000-60000)"
    )
    viewport_width: int = Field(
        default=1920,
        ge=320,
        le=3840,
        description="Viewport width in pixels"
    )
    viewport_height: int = Field(
        default=1080,
        ge=240,
        le=2160,
        description="Viewport height in pixels"
    )
    full_page: bool = Field(
        default=False,
        description="Capture full page (for screenshot/pdf actions)"
    )
    user_agent: Optional[str] = Field(
        default=None,
        description="Custom user agent string"
    )
    headers: Optional[dict[str, str]] = Field(
        default=None,
        description="Additional HTTP headers to send"
    )

    @field_validator('url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Validate URL scheme and format."""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        # Basic URL format validation
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        if not url_pattern.match(v):
            raise ValueError('Invalid URL format')
        return v


class BrowseResponse(BaseModel):
    """Success response model for browse endpoint."""
    status: str = Field(default="success", description="Response status")
    url: str = Field(..., description="Requested URL")
    final_url: Optional[str] = Field(None, description="Final URL after redirects")
    content: Optional[str] = Field(None, description="HTML content (for render action)")
    screenshot: Optional[str] = Field(None, description="Base64 encoded screenshot (for screenshot action)")
    pdf: Optional[str] = Field(None, description="Base64 encoded PDF (for pdf action)")
    content_type: Optional[str] = Field(None, description="Content type of response")
    page_title: Optional[str] = Field(None, description="Page title")
    execution_time_ms: float = Field(..., description="Total execution time in milliseconds")


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str = Field(default="healthy", description="Service health status")
    active_contexts: int = Field(..., description="Number of active browser contexts")
    available_slots: int = Field(..., description="Available browser slots")
    memory_usage_mb: Optional[float] = Field(None, description="Current memory usage in MB")
    uptime_seconds: float = Field(..., description="Service uptime in seconds")


class ErrorResponse(BaseModel):
    """Error response model."""
    status: str = Field(default="error", description="Response status")
    error_code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: Optional[dict[str, Any]] = Field(None, description="Additional error details")


class MetricsResponse(BaseModel):
    """Metrics response for monitoring."""
    total_requests: int = Field(..., description="Total number of requests served")
    successful_requests: int = Field(..., description="Successful requests count")
    failed_requests: int = Field(..., description="Failed requests count")
    average_response_time_ms: float = Field(..., description="Average response time")
    active_contexts: int = Field(..., description="Current active browser contexts")
    queued_requests: int = Field(..., description="Requests waiting in queue")
