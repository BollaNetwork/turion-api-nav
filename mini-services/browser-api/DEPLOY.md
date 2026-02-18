# Browser API Service - Deployment Guide

High-performance API service for automated internet navigation (Web Scraping/Rendering) using FastAPI and Playwright.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [API Usage](#api-usage)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

---

## Prerequisites

### System Requirements
- **OS**: Ubuntu 22.04 LTS (or compatible Linux)
- **RAM**: Minimum 8GB (4GB allocated to container)
- **CPU**: 2+ vCPUs recommended
- **Disk**: 10GB free space minimum

### Software Requirements
- Docker 24.0+
- Docker Compose v2.0+

### Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

---

## Quick Start

### 1. Clone/Copy Project Files

```bash
# Create project directory
mkdir -p ~/browser-api && cd ~/browser-api

# Copy all files:
# - Dockerfile
# - docker-compose.yml
# - nginx.conf
# - requirements.txt
# - app/ directory with all Python files
```

### 2. Build and Run (Development)

```bash
# Build the Docker image
docker compose build

# Start the service
docker compose up -d browser-api

# Check logs
docker compose logs -f browser-api
```

### 3. Verify Service

```bash
# Health check
curl http://localhost:8000/health

# View API documentation
# Open browser: http://localhost:8000/docs
```

---

## Production Deployment

### 1. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p ~/browser-api/ssl

# Option A: Let's Encrypt (Recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/browser-api/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/browser-api/ssl/
sudo chown $USER:$USER ~/browser-api/ssl/*

# Option B: Self-signed (Development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ~/browser-api/ssl/privkey.pem \
  -out ~/browser-api/ssl/fullchain.pem
```

### 2. Configure Nginx (if using SSL)

Edit `nginx.conf` and update the server_name:

```nginx
server_name api.your-domain.com;
```

### 3. Deploy with Full Stack

```bash
# Build and start all services (API + Nginx)
docker compose up -d --build

# Verify all containers running
docker compose ps
```

### 4. Enable Auto-start

```bash
# Docker services automatically restart due to 'restart: always' policy
# Verify with:
docker compose ps
```

---

## Configuration

### Environment Variables

Create `.env` file for custom configuration:

```bash
# .env file
LOG_LEVEL=INFO
MAX_CONCURRENT_BROWSERS=3
DEFAULT_TIMEOUT=30000
```

### Resource Limits (docker-compose.yml)

For 8GB RAM VPS, current settings are optimized:

```yaml
deploy:
  resources:
    limits:
      memory: 4G      # 4GB max for container
      cpus: "2.0"     # 2 vCPUs max
```

**Adjust for your server:**
- 4GB RAM: Set `memory: 2G`, reduce `MAX_CONCURRENT_BROWSERS=2`
- 16GB RAM: Set `memory: 8G`, increase `MAX_CONCURRENT_BROWSERS=5`

### Playwright Browser Settings

The service only installs Chromium to save disk space. To add other browsers:

```dockerfile
# In Dockerfile, change:
RUN playwright install chromium --with-deps
# To:
RUN playwright install chromium firefox webkit --with-deps
```

---

## API Usage

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/health` | Detailed health status |
| GET | `/api/v1/metrics` | Service metrics |
| POST | `/api/v1/browse` | Main navigation endpoint |
| POST | `/api/v1/render` | Quick HTML render |
| POST | `/api/v1/screenshot` | Quick screenshot |
| POST | `/api/v1/pdf` | Quick PDF generation |

### Example Requests

#### 1. Render HTML

```bash
curl -X POST "http://localhost:8000/api/v1/browse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "render"
  }'
```

#### 2. Take Screenshot

```bash
curl -X POST "http://localhost:8000/api/v1/browse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "screenshot",
    "full_page": true,
    "wait_for": 2000
  }'
```

#### 3. Wait for Selector & Execute JS

```bash
curl -X POST "http://localhost:8000/api/v1/browse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "render",
    "wait_for": ".content-loaded",
    "execute_js": "window.scrollTo(0, document.body.scrollHeight);"
  }'
```

#### 4. With Proxy

```bash
curl -X POST "http://localhost:8000/api/v1/browse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "render",
    "proxy_config": {
      "server": "http://proxy.example.com:8080",
      "username": "user",
      "password": "pass"
    }
  }'
```

### Response Format

```json
{
  "status": "success",
  "url": "https://example.com",
  "final_url": "https://example.com/redirected",
  "content": "<html>...</html>",
  "page_title": "Example Domain",
  "content_type": "text/html",
  "execution_time_ms": 1234.56
}
```

---

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:8000/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "active_contexts": 2,
  "available_slots": 1,
  "memory_usage_mb": 1024.5,
  "uptime_seconds": 3600.0
}
```

### Metrics Endpoint

```bash
curl http://localhost:8000/api/v1/metrics
```

Response:
```json
{
  "total_requests": 1000,
  "successful_requests": 950,
  "failed_requests": 50,
  "average_response_time_ms": 2345.67,
  "active_contexts": 2,
  "queued_requests": 1
}
```

### Log Monitoring

```bash
# Real-time logs
docker compose logs -f browser-api

# Last 100 lines
docker compose logs --tail=100 browser-api

# Filter for errors
docker compose logs browser-api 2>&1 | grep -i error
```

### Resource Monitoring

```bash
# Container resource usage
docker stats browser-api

# System memory
free -h

# Disk usage
df -h
```

---

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker compose logs browser-api

# Common causes:
# - Port 8000 already in use
# - Insufficient memory
# - Playwright browser not installed
```

#### 2. Timeout Errors

```bash
# Increase timeout in request
curl -X POST "http://localhost:8000/api/v1/browse" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://slow-site.com", "timeout": 60000}'
```

#### 3. Memory Issues

```bash
# Check container memory usage
docker stats --no-stream browser-api

# Reduce concurrent browsers
# Edit app/services/browser.py:
MAX_CONCURRENT_BROWSERS = 2
```

#### 4. Browser Context Leaks

```bash
# Check active contexts
curl http://localhost:8000/api/v1/health

# If active_contexts stays high, restart service
docker compose restart browser-api
```

### Debug Mode

```bash
# Run with debug logging
docker compose run --rm -e LOG_LEVEL=DEBUG browser-api
```

---

## Security Considerations

### 1. SSRF Protection

The service blocks requests to internal IPs by default:
- 127.0.0.0/8 (localhost)
- 10.0.0.0/8 (private network)
- 172.16.0.0/12 (private network)
- 192.168.0.0/16 (private network)

To whitelist specific internal hosts, modify `SSRFProtection` class in `app/services/browser.py`.

### 2. Rate Limiting

Nginx configuration includes rate limiting:
- 10 requests/second per IP
- Burst of 20 requests allowed

Adjust in `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;
```

### 3. Input Validation

All requests are validated using Pydantic models:
- URL must start with `http://` or `https://`
- Timeout range: 1000-60000ms
- Viewport limits: 320-3840px width, 240-2160px height

### 4. Non-Root User

Container runs as non-root user `browserapi` for security.

### 5. Resource Limits

Docker resource limits prevent resource exhaustion:
- Memory: 4GB hard limit
- CPU: 2 vCPU limit

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet/Clients                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Port 80/443)                       │
│  - SSL Termination                                           │
│  - Rate Limiting                                             │
│  - Reverse Proxy                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Browser API Service (Port 8000)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    FastAPI Application                 │  │
│  │  - Input Validation (Pydantic)                        │  │
│  │  - SSRF Protection                                    │  │
│  │  - Route Handling                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Browser Manager                      │  │
│  │  - Semaphore (Max 3 concurrent)                       │  │
│  │  - Context Isolation                                  │  │
│  │  - Anti-Detection Scripts                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Playwright (Chromium)                     │  │
│  │  - Headless Browser                                   │  │
│  │  - Shared Instance                                    │  │
│  │  - Isolated Contexts                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Support

For issues and feature requests, please check:
1. Application logs: `docker compose logs browser-api`
2. Health endpoint: `/api/v1/health`
3. Metrics endpoint: `/api/v1/metrics`
