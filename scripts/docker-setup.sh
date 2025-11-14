#!/bin/bash

# Docker setup script for CarTrader
set -e

echo "🐳 CarTrader Docker Setup"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing!"
    exit 1
fi

# Function to start services
start_services() {
    local env=$1
    if [ "$env" = "dev" ]; then
        echo "🚀 Starting development environment..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    elif [ "$env" = "prod" ]; then
        echo "🚀 Starting production environment..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        echo "🚀 Starting services..."
        docker-compose up -d
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    docker-compose down
}

# Function to view logs
view_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Function to rebuild services
rebuild_services() {
    local env=$1
    if [ "$env" = "dev" ]; then
        echo "🔨 Rebuilding development environment..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    elif [ "$env" = "prod" ]; then
        echo "🔨 Rebuilding production environment..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    else
        echo "🔨 Rebuilding services..."
        docker-compose build --no-cache
    fi
}

# Parse command line arguments
case "${1:-}" in
    start)
        start_services "${2:-}"
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services "${2:-}"
        ;;
    logs)
        view_logs "${2:-}"
        ;;
    rebuild)
        rebuild_services "${2:-}"
        ;;
    status)
        docker-compose ps
        ;;
    clean)
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|status|clean} [dev|prod]"
        echo ""
        echo "Commands:"
        echo "  start [dev|prod]  - Start services (default: production)"
        echo "  stop              - Stop all services"
        echo "  restart [dev|prod]- Restart services"
        echo "  logs [service]    - View logs (all services or specific service)"
        echo "  rebuild [dev|prod]- Rebuild Docker images"
        echo "  status            - Show service status"
        echo "  clean             - Stop services and clean up volumes"
        exit 1
        ;;
esac

