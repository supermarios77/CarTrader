# Docker Configuration

This directory contains Docker-related configuration files for the CarTrader application.

## Structure

```
docker/
├── nginx/
│   ├── Dockerfile          # Nginx container image
│   └── nginx.conf          # Nginx configuration
└── postgres/
    └── init.sql            # PostgreSQL initialization script
```

## Services

### Nginx
- Reverse proxy for frontend and backend
- Handles SSL/TLS termination
- Rate limiting and security headers
- WebSocket support for Socket.io

### PostgreSQL
- Database initialization scripts
- Extension setup (uuid-ossp, pg_trgm)

## Usage

See the main README.md for Docker setup instructions.

