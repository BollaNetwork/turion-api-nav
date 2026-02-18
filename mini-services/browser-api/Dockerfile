# =============================================================================
# Browser API Service - Optimized Dockerfile for Playwright
# =============================================================================
# Base: Official Playwright Python image (Ubuntu 22.04 Jammy)
# Only installs Chromium to save disk space (~600MB vs ~1.5GB for all browsers)
# =============================================================================

FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --user -r requirements.txt

# =============================================================================
# Production Stage
# =============================================================================
FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy AS production

# Labels
LABEL maintainer="Browser API Service" \
      version="1.0.0" \
      description="High-performance web scraping API with Playwright"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    # Playwright settings
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    # Disable browser sandbox for container environment
    DISPLAY=:99

# Create non-root user for security
RUN groupadd -r browserapi && useradd -r -g browserapi browserapi

# Set working directory
WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /home/browserapi/.local
ENV PATH=/home/browserapi/.local/bin:$PATH

# Copy application code
COPY --chown=browserapi:browserapi . .

# Install only Chromium browser (saves ~900MB vs all browsers)
# The base image already has browsers, we just ensure only chromium is present
RUN playwright install chromium --with-deps

# Clean up unnecessary files to reduce image size
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /root/.cache

# Create directory for any temporary files
RUN mkdir -p /tmp/browser-api && chown browserapi:browserapi /tmp/browser-api

# Switch to non-root user
USER browserapi

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with Gunicorn + Uvicorn for production stability
# Single worker to manage browser resources efficiently
CMD ["gunicorn", "app.main:app", \
     "--workers", "1", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--graceful-timeout", "30", \
     "--keep-alive", "5", \
     "--log-level", "info", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
