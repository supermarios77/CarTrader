# Docker Setup Guide 🐳

Complete Docker configuration for CarTrader - production-ready with no loopholes.

## Architecture

```
┌─────────────────┐
│   Nginx (80/443) │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Next.js│ │NestJS │
│Frontend│ │Backend│
└───┬───┘ └──┬────┘
    │        │
    │    ┌───▼───┐
    │    │Redis  │
    │    └───┬───┘
    │        │
    └───┬────┘
        │
    ┌───▼──────┐
    │PostgreSQL│
    └──────────┘
```

## Quick Start

> **💡 No Domain Needed!** This setup works perfectly with:
> - `http://localhost` (local development)
> - `http://YOUR_VPS_IP` (production without domain)
> - `https://yourdomain.com` (only if you have a domain)
>
> SSL/HTTPS is completely optional. HTTP works fine for self-hosted applications.

### Development

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings (optional for dev)

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with production values (REQUIRED)

# Build and start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Using the Setup Script

```bash
# Start development
./scripts/docker-setup.sh start dev

# Start production
./scripts/docker-setup.sh start prod

# View logs
./scripts/docker-setup.sh logs

# Rebuild
./scripts/docker-setup.sh rebuild prod

# Stop
./scripts/docker-setup.sh stop

# Clean everything
./scripts/docker-setup.sh clean
```

## Services

### Backend (NestJS)
- **Port**: 3001 (internal)
- **Health Check**: `/health`
- **Image**: Multi-stage build, optimized
- **User**: Non-root (nestjs:1001)

### Frontend (Next.js)
- **Port**: 3000 (internal)
- **Health Check**: `/api/health`
- **Image**: Multi-stage build with standalone output
- **User**: Non-root (nextjs:1001)

### PostgreSQL
- **Port**: 5432 (exposed in dev, internal in prod)
- **Data**: Persistent volume
- **Extensions**: uuid-ossp, pg_trgm
- **Health Check**: pg_isready

### Redis
- **Port**: 6379 (exposed in dev, internal in prod)
- **Data**: Persistent volume (AOF enabled)
- **Health Check**: redis-cli ping

### MinIO
- **API Port**: 9000 (exposed in dev, internal in prod)
- **Console Port**: 9001 (exposed in dev, internal in prod)
- **Data**: Persistent volume
- **Health Check**: HTTP health endpoint

### Nginx
- **HTTP Port**: 80
- **HTTPS Port**: 443
- **Health Check**: `/health`
- **Features**: Rate limiting, security headers, WebSocket support

## Security Features

### ✅ Production-Ready Security

1. **Non-root Users**: All containers run as non-root users
2. **Minimal Base Images**: Alpine Linux for smaller attack surface
3. **Multi-stage Builds**: No dev dependencies in production images
4. **Resource Limits**: CPU and memory limits on all services
5. **Health Checks**: All services have health checks
6. **Network Isolation**: Services communicate via internal network
7. **Secrets Management**: Environment variables (use secrets manager in production)
8. **Rate Limiting**: Nginx rate limiting for API and general traffic
9. **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
10. **No Port Exposure**: Production services not exposed to host (except Nginx)

## Environment Variables

### No Domain Required! 🎉

**The setup works perfectly without a domain.** You can use:
- **Localhost**: `http://localhost` (for local development)
- **VPS IP**: `http://YOUR_VPS_IP` (for production without domain)
- **Domain**: `https://yourdomain.com` (only if you have one and want SSL)

### Required for Production

```bash
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=strong_password_here
POSTGRES_DB=cartrader
REDIS_PASSWORD=strong_redis_password
MINIO_ROOT_USER=minio_user
MINIO_ROOT_PASSWORD=strong_minio_password
JWT_SECRET=min_32_characters_long_secret

# For localhost (no domain):
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# OR for VPS IP (no domain):
FRONTEND_URL=http://YOUR_VPS_IP:3000
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001

# OR for domain (if you have one):
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Development Defaults

Development uses default values (see `docker-compose.dev.yml`), but you should still set strong passwords.

## Data Persistence

All data is stored in Docker volumes:

- `postgres_data`: Database files
- `redis_data`: Redis AOF files
- `minio_data`: Object storage files

### Backup Strategy

```bash
# Backup PostgreSQL
docker exec cartrader-postgres pg_dump -U cartrader cartrader > backup.sql

# Backup Redis
docker exec cartrader-redis redis-cli --rdb /data/dump.rdb

# Backup MinIO (use MinIO client)
mc mirror minio/data ./backups/minio
```

## SSL/TLS Setup (Optional - Only if you have a domain)

**Note**: SSL/TLS is completely optional. The application works fine over HTTP with localhost or VPS IP.

### If you have a domain and want HTTPS:

1. Install certbot
2. Generate certificates:
```bash
certbot certonly --standalone -d yourdomain.com
```

3. Copy certificates to `docker/nginx/ssl/`:
```bash
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/key.pem
```

4. Uncomment HTTPS server block in `docker/nginx/nginx.conf`
5. Update `.env` with your domain URLs
6. Restart Nginx: `docker-compose restart nginx`

### Without a domain:

- Use `http://localhost` for local development
- Use `http://YOUR_VPS_IP` for production
- Nginx is configured to work with any hostname (no domain required)
- HTTP works perfectly fine for self-hosted applications

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health Checks

```bash
# Backend
curl http://localhost/api/health

# Frontend
curl http://localhost/api/health

# Nginx
curl http://localhost/health
```

### Resource Usage

```bash
docker stats
```

## Troubleshooting

### Services won't start

1. Check logs: `docker-compose logs [service]`
2. Verify environment variables in `.env`
3. Check port conflicts: `netstat -tulpn | grep :80`
4. Verify Docker has enough resources

### Database connection issues

1. Wait for PostgreSQL to be healthy: `docker-compose ps postgres`
2. Check DATABASE_URL in environment
3. Verify network: `docker network inspect cartrader_cartrader-network`

### Build failures

1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check disk space: `df -h`

### Permission issues

All containers run as non-root. If you encounter permission issues:
1. Check volume ownership
2. Verify user IDs in Dockerfiles
3. Check file permissions in mounted volumes

## Production Deployment Checklist

- [ ] Set strong passwords in `.env`
- [ ] Configure `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` (localhost, VPS IP, or domain)
- [ ] Configure firewall (ports 80, 443 if using SSL, 22 for SSH)
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Set resource limits appropriate for your VPS
- [ ] Enable log rotation
- [ ] Set up health check monitoring
- [ ] Review and update security headers
- [ ] Test disaster recovery procedures
- [ ] (Optional) Configure SSL certificates if you have a domain
- [ ] (Optional) Set up domain DNS if you have a domain

## Scaling

### Horizontal Scaling

```yaml
# In docker-compose.yml, you can scale services:
docker-compose up -d --scale backend=3 --scale frontend=2
```

### Load Balancing

Nginx automatically load balances between multiple instances when scaled.

## Maintenance

### Update Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean Up

```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (WARNING: deletes data)
docker-compose down -v

# Clean up system
docker system prune -a
```

## Support

For issues or questions, check:
- Docker logs: `docker-compose logs`
- Service health: `docker-compose ps`
- Network connectivity: `docker network inspect`

