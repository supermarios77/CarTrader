# Observability Runbook

## Stack Overview

| Component | Purpose | Ports |
|-----------|---------|-------|
| OpenTelemetry Collector | Receive OTLP traffic from services; fan out traces/logs/metrics | gRPC 4317, HTTP 4318, Prometheus 8889 |
| Loki | Central log aggregation | 3100 |
| Promtail | Ships Docker container logs to Loki | n/a |
| Tempo | Trace storage compatible with Grafana Tempo datasource | 3200 |
| Grafana | Dashboards & ad-hoc log/trace queries | 3001 |

## Bringing the stack up

```bash
# Requires Docker desktop
pnpm install
DOCKER_BUILDKIT=1 docker compose up -d otel-collector loki tempo grafana promtail
```

The collector configuration lives in `ops/observability/otel-collector-config.yaml` and exposes readiness/liveness on `http://localhost:13133`. Tempo and Loki store data on named Docker volumes (`tempo-data`, `loki-data`).

## Wiring services

Each service exposes two config flags:

- `TRACING_ENABLED` – set to `true` to emit OTLP traces/logs/metrics.
- `OTEL_EXPORTER_OTLP_ENDPOINT` – defaults to `http://otel-collector:4318/v1/traces` in docker-compose.

Logs are structured JSON (pino) and now include trace/span IDs. Promtail ships container logs by tailing `/var/lib/docker/containers/*/*-json.log` and adds the `service.name` label via the OTEL collector.

Metrics are already surfaced via Prometheus exporter on the collector. Grafana is pre-provisioned with Loki, Tempo, and the OTEL collector as datasources (see `ops/observability/grafana`).

## Dashboards & Queries

- Grafana URL: `http://localhost:3001` (admin/admin initial credentials).
- Explore logs: select `Loki` datasource, query `{service_name="api-gateway"}`.
- Trace exemplars: select `Tempo` datasource, filter by `service.name = api-gateway`.
- Metrics: use `OtelCollector` datasource, e.g. `cartrader_http_request_duration_seconds_sum`.

## Production Notes

- Ship collector and Grafana via Helm charts or Terraform modules (AWS OTEL Collector, Grafana Cloud, etc.).
- Configure persistence/retention (Loki chunk store, Tempo WAL) according to compliance requirements.
- Enable alerting (Grafana Alerting or Prometheus Alertmanager) for high error rates / long tail latency.
