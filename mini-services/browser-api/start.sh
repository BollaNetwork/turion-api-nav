#!/bin/bash
# =============================================================================
# Browser API Service - Quick Start Script
# =============================================================================

set -e

echo "🚀 Browser API Service - Starting..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available${NC}"
    exit 1
fi

# Function to show help
show_help() {
    echo "Usage: ./start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build Docker image"
    echo "  start     Start the service"
    echo "  stop      Stop the service"
    echo "  restart   Restart the service"
    echo "  logs      Show logs"
    echo "  status    Show service status"
    echo "  test      Run a test request"
    echo "  clean     Remove containers and images"
    echo "  help      Show this help message"
}

# Function to run test
run_test() {
    echo -e "${YELLOW}Testing API health endpoint...${NC}"
    curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health
    
    echo ""
    echo -e "${YELLOW}Testing browse endpoint...${NC}"
    curl -s -X POST "http://localhost:8000/api/v1/browse" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://example.com", "action": "render"}' \
        | python3 -m json.tool 2>/dev/null || echo "API not responding"
}

# Main logic
case "${1:-start}" in
    build)
        echo -e "${YELLOW}Building Docker image...${NC}"
        docker compose build
        echo -e "${GREEN}Build complete!${NC}"
        ;;
    start)
        echo -e "${YELLOW}Starting services...${NC}"
        docker compose up -d browser-api
        echo -e "${GREEN}Service started!${NC}"
        echo ""
        echo "API Documentation: http://localhost:8000/docs"
        echo "Health Check: http://localhost:8000/health"
        ;;
    stop)
        echo -e "${YELLOW}Stopping services...${NC}"
        docker compose down
        echo -e "${GREEN}Service stopped!${NC}"
        ;;
    restart)
        echo -e "${YELLOW}Restarting services...${NC}"
        docker compose restart
        echo -e "${GREEN}Service restarted!${NC}"
        ;;
    logs)
        docker compose logs -f browser-api
        ;;
    status)
        docker compose ps
        echo ""
        echo -e "${YELLOW}Container stats:${NC}"
        docker stats --no-stream browser-api 2>/dev/null || echo "Container not running"
        ;;
    test)
        run_test
        ;;
    clean)
        echo -e "${YELLOW}Removing containers and images...${NC}"
        docker compose down -v --rmi local
        echo -e "${GREEN}Cleanup complete!${NC}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
