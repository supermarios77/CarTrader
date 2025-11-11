# Backup & Restore Runbook

## Data Stores & Retention

| Store | Location | Retention | Notes |
|-------|----------|-----------|-------|
| Postgres | `postgres-data` volume / managed RDS | Daily snapshots + Point-In-Time Recovery (PITR) 7 days | Use `pg_dump` for ad-hoc exports |
| MinIO (media assets) | `minio-data` | Daily replication to object store (S3/GCS) | Versioning enabled on bucket |
| OpenSearch | `opensearch-data` | Snapshots every 6h, retained 7 days | Store in S3-compatible repo |
| Loki logs | `loki-data` | 7-day retention (configure in `loki-config.yaml`) | Increase for compliance |
| Tempo traces | `tempo-data` | 3-day retention (WAL + local store) | Export to object storage for longer history |

## Backup Procedures

### Postgres (local compose)

```bash
# Snapshot using pg_dump
PGPASSWORD=cartrader pg_dump \
  -h localhost -p 5432 -U cartrader \
  -d cartrader \
  -Fc -f backups/postgres/$(date +%Y%m%d%H%M).dump
```

Automate via cron/CI job. In production use managed database snapshots and PITR.

### MinIO bucket sync

```bash
# Requires mc (MinIO client)
mc mirror local/cartrader-media s3/archive-cartrader-media
```

### OpenSearch snapshot

```bash
curl -XPUT http://localhost:9200/_snapshot/daily_repo \
  -H 'Content-Type: application/json' \
  -d '{"type":"fs","settings":{"location":"/opensearch/snapshots"}}'

curl -XPUT http://localhost:9200/_snapshot/daily_repo/snapshot_$(date +%Y%m%d)
```

Automate via Lambda/Cloud Scheduler.

## Restore Procedures

### Postgres

```bash
PGPASSWORD=cartrader pg_restore \
  -h localhost -p 5432 -U cartrader \
  -d cartrader \
  backups/postgres/<snapshot>.dump
```

For managed RDS/Cloud SQL, perform PITR to timestamp and update connection strings.

### MinIO

```bash
mc mirror s3/archive-cartrader-media local/cartrader-media
```

### OpenSearch

```bash
curl -XPOST http://localhost:9200/_snapshot/daily_repo/snapshot_YYYYMMDD/_restore
```

Ensure indices restored with correct aliases.

## Testing & Compliance

- Perform restoration drills quarterly (staging environment).
- Verify data integrity (hash counts, sample listings/media).
- Document each drill outcome in the operations log.
- Update retention to meet regulatory requirements (GDPR/PCI, etc.).

## Automation Scripts

Store infrastructure-as-code (Terraform/Helm) to manage backups. Reference `infra/` for templates (coming soon).
