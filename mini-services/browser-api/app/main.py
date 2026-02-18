"""
Browser API Service - Main Application Entry Point.
High-performance web scraping/rendering API using FastAPI and Playwright.
"""
import sys
import asyncio
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import orjson

from .routes import router as api_router
from .services.browser import browser_manager
from .models.schemas import ErrorResponse

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events for browser resources.
    """
    # Startup
    logger.info("Starting Browser API Service...")
    
    try:
        # Pre-initialize browser manager
        await browser_manager.initialize()
        logger.info("Browser manager initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize browser manager: {e}")
        # Continue anyway - browser will be initialized on first request
    
    yield
    
    # Shutdown
    logger.info("Shutting down Browser API Service...")
    await browser_manager.shutdown()
    logger.info("Browser manager shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Browser API Service",
    description=(
        "High-performance API for automated internet navigation "
        "(Web Scraping/Rendering) using Playwright headless Chromium."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom JSON response with orjson for better performance
class ORJSONResponse(JSONResponse):
    media_type = "application/json"

    def render(self, content) -> bytes:
        return orjson.dumps(
            content,
            option=orjson.OPT_INDENT_2 | orjson.OPT_SERIALIZE_NUMPY,
        )


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    logger.exception(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=jsonable_encoder(
            ErrorResponse(
                status="error",
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details={"error_type": type(exc).__name__},
            )
        ),
    )


# Handle memory errors specifically
@app.exception_handler(MemoryError)
async def memory_error_handler(request: Request, exc: MemoryError):
    """Handle memory errors when service is overloaded."""
    logger.critical(f"Memory error: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=jsonable_encoder(
            ErrorResponse(
                status="error",
                error_code="SERVICE_OVERLOADED",
                message="Service is temporarily overloaded due to memory constraints. Please retry later.",
            )
        ),
    )


# Handle asyncio timeout errors
@app.exception_handler(asyncio.TimeoutError)
async def timeout_error_handler(request: Request, exc: asyncio.TimeoutError):
    """Handle timeout errors."""
    logger.error(f"Timeout error: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        content=jsonable_encoder(
            ErrorResponse(
                status="error",
                error_code="TIMEOUT_ERROR",
                message="Request processing timed out",
            )
        ),
    )


# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirects to docs."""
    return {
        "service": "Browser API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


# Include API routes
app.include_router(api_router)


# Health check at root level for load balancers
@app.get("/health", tags=["Health"])
async def root_health():
    """Simple health check for load balancers."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1,  # Single worker for browser resource management
        log_level="info",
        access_log=True,
    )
