# Quick Start: NFS Setup for Docker on macOS

## What This Does

Improves Docker volume mount performance on macOS from 14x slower than native (default) to 2.5x slower (NFS), providing significant speed improvements for development.

## Setup (One-Time)

1. **Run the setup script:**
   ```bash
   ./scripts/setup-nfs.sh
   ```
   
   This will:
   - Stop running Docker containers
   - Configure NFS exports
   - Update NFS configuration  
   - Restart NFS daemon
   - Restart Docker

2. **Update the NFS path in docker-compose.yml:**
   
   The script will show you the correct path. Update line 378 in `docker-compose.yml`:
   ```yaml
   device: ":/System/Volumes/Data/Users/YOUR_USERNAME/Documents/Projects/Web/cartrader/ops/observability"
   ```
   
   Or get the path automatically:
   ```bash
   cd /Users/mario/Documents/Projects/Web/cartrader
   ./scripts/get-nfs-path.sh
   # Use this output + /ops/observability
   ```

3. **Restart services:**
   ```bash
   docker compose down
   docker compose up -d
   ```

## What's Using NFS

The following services now use NFS volumes for config files:
- **otel-collector**: `/etc/observability/otel-collector-config.yaml`
- **loki**: `/etc/observability/loki-config.yaml`
- **tempo**: `/etc/observability/tempo.yaml`
- **promtail**: `/etc/observability/promtail-config.yaml`
- **grafana**: Uses `:delegated` bind mount (requires specific directory structure)

## Performance Comparison

- **Default (consistent)**: 14x slower than native ❌
- **Delegated mode**: 8x slower than native ⚠️
- **NFS mode**: 2.5x slower than native ✅

## Troubleshooting

**If services fail to start:**
1. Check NFS is running: `sudo nfsd status`
2. Check exports: `cat /etc/exports`
3. Verify path in docker-compose.yml matches your actual project path
4. Restart NFS: `sudo nfsd restart`

**To disable NFS and use bind mounts:**
Revert to bind mounts in docker-compose.yml:
```yaml
volumes:
  - ./ops/observability/otel-collector-config.yaml:/etc/otel/config.yaml:ro
```

See `README-NFS.md` for more details.

