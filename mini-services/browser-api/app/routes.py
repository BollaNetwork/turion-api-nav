"""
API Routes for Browser Service.
"""
import time
from typing import Any

import structlog
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

from .models.schemas import (
    BrowseRequest,
    BrowseResponse,
    ErrorResponse,
    HealthResponse,
    MetricsResponse,
)
from .services.browser import browser_manager

logger = structlog.get_logger()

router = APIRouter(prefix="/api/v1", tags=["Browser API"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns service health status and resource usage.",
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint for monitoring.
    Returns current browser context count and resource metrics.
    """
    try:
        import psutil
        memory_usage = psutil.Process().memory_info().rss / 1024 / 1024
    except ImportError:
        memory_usage = None
    
    return HealthResponse(
        status="healthy",
        active_contexts=browser_manager.active_contexts,
        available_slots=browser_manager.available_slots,
        memory_usage_mb=memory_usage,
        uptime_seconds=browser_manager.uptime,
    )


@router.get(
    "/metrics",
    response_model=MetricsResponse,
    summary="Service Metrics",
    description="Returns detailed service metrics for monitoring.",
)
async def get_metrics() -> MetricsResponse:
    """
    Get service metrics including request counts and performance data.
    """
    metrics = browser_manager.metrics
    return MetricsResponse(**metrics)


@router.post(
    "/browse",
    response_model=BrowseResponse,
    responses={
        200: {"description": "Successful browser navigation"},
        400: {"model": ErrorResponse, "description": "Invalid request parameters"},
        502: {"model": ErrorResponse, "description": "Network/navigation error"},
        503: {"model": ErrorResponse, "description": "Service overloaded"},
        504: {"model": ErrorResponse, "description": "Request timeout"},
    },
    summary="Navigate and Extract",
    description="Navigate to a URL and extract content (HTML, screenshot, or PDF).",
)
async def browse(request: BrowseRequest) -> BrowseResponse:
    """
    Main browser navigation endpoint.
    
    - **url**: Target URL to navigate to
    - **action**: Type of extraction (render/screenshot/pdf)
    - **wait_for**: Optional CSS selector or time in ms to wait
    - **execute_js**: Optional JavaScript to execute before capture
    - **proxy_config**: Optional proxy configuration
    """
    log = logger.bind(url=request.url, action=request.action.value)
    log.info("Processing browse request")
    
    try:
        result = await browser_manager.browse(request)
        log.info(
            "Browse request completed",
            execution_time_ms=result.execution_time_ms,
        )
        return result
    
    except ValueError as e:
        # SSRF or validation error
        log.warning(f"Request validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                status="error",
                error_code="VALIDATION_ERROR",
                message=str(e),
            ).model_dump(),
        )
    
    except TimeoutError as e:
        # Page load timeout
        log.error(f"Timeout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=ErrorResponse(
                status="error",
                error_code="TIMEOUT_ERROR",
                message=str(e),
                details={"timeout_ms": request.timeout},
            ).model_dump(),
        )
    
    except ConnectionError as e:
        # Network/navigation error
        log.error(f"Connection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=ErrorResponse(
                status="error",
                error_code="NAVIGATION_ERROR",
                message=str(e),
            ).model_dump(),
        )
    
    except MemoryError as e:
        # Service overloaded
        log.critical(f"Memory error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ErrorResponse(
                status="error",
                error_code="SERVICE_OVERLOADED",
                message="Service is temporarily overloaded. Please retry later.",
            ).model_dump(),
        )
    
    except Exception as e:
        # Unexpected error
        log.exception(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                status="error",
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details={"error_type": type(e).__name__},
            ).model_dump(),
        )


@router.post(
    "/render",
    response_model=BrowseResponse,
    summary="Quick Render",
    description="Quick render endpoint - equivalent to browse with action='render'.",
)
async def render_html(url: str) -> BrowseResponse:
    """
    Quick render endpoint for HTML extraction.
    Convenience method for simple HTML rendering.
    """
    request = BrowseRequest(url=url, action="render")
    return await browse(request)


@router.post(
    "/screenshot",
    response_model=BrowseResponse,
    summary="Quick Screenshot",
    description="Quick screenshot endpoint - equivalent to browse with action='screenshot'.",
)
async def take_screenshot(
    url: str,
    full_page: bool = False,
    wait_for: str | int | None = None,
) -> BrowseResponse:
    """
    Quick screenshot endpoint.
    Convenience method for taking screenshots.
    """
    request = BrowseRequest(
        url=url,
        action="screenshot",
        full_page=full_page,
        wait_for=wait_for,
    )
    return await browse(request)


@router.post(
    "/pdf",
    response_model=BrowseResponse,
    summary="Quick PDF",
    description="Quick PDF endpoint - equivalent to browse with action='pdf'.",
)
async def generate_pdf(url: str) -> BrowseResponse:
    """
    Quick PDF generation endpoint.
    Convenience method for PDF generation.
    """
    request = BrowseRequest(url=url, action="pdf")
    return await browse(request)
