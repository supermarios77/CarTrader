# NFS Setup for Docker on macOS

This project includes NFS configuration to improve Docker volume mount performance on macOS, as described in [this article](https://vifintech.com/blog/docker-for-mac-performance-using-nfs).

## Why NFS?

By default, Docker volume mounts on macOS are extremely slow (14x slower than native). Using NFS improves this to only 2.5x slower than native, providing significant performance benefits for development.

## Setup Instructions

### 1. Run the NFS Setup Script

```bash
./scripts/setup-nfs.sh
```

This script will:
- Stop running Docker containers
- Configure NFS exports
- Update NFS configuration
- Restart NFS daemon
- Restart Docker

**Note:** This script requires administrator access for NFS configuration.

### 2. Update docker-compose.yml

After running the setup script, you need to update the NFS volume device path in `docker-compose.yml`:

```bash
# Get the correct NFS path for your system
./scripts/get-nfs-path.sh
```

Then update the `nfs-observability-config` volume device path in `docker-compose.yml` to match your project's location.

### 3. Restart Services

```bash
docker compose down
docker compose up -d
```

## Performance Benefits

- **Default (consistent)**: 14x slower than native
- **Delegated mode**: 8x slower than native  
- **NFS mode**: 2.5x slower than native ✅

## Troubleshooting

If you encounter issues:

1. **Check NFS exports:**
   ```bash
   cat /etc/exports
   ```

2. **Restart NFS daemon:**
   ```bash
   sudo nfsd restart
   ```

3. **Check Docker volumes:**
   ```bash
   docker volume ls
   docker volume inspect cartrader_nfs-observability-config
   ```

4. **Remove and recreate volumes if needed:**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

## Alternative: Using Delegated Mode

If you prefer not to use NFS, you can use `:delegated` mount option for better performance:

```yaml
volumes:
  - ./ops/observability/config.yaml:/etc/config.yaml:delegated
```

However, NFS provides significantly better performance.

