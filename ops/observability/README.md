# Observability Stack

Configuration for the local telemetry stack used in development and smoke testing.

## Components

| Service | Config | Notes |
|---------|--------|-------|
| OpenTelemetry Collector | `otel-collector-config.yaml` | Receives OTLP traces/logs/metrics and forwards to Loki/Tempo/Prometheus. Health: `http://localhost:13133/healthz`. |
| Loki | `loki-config.yaml` | Stores application logs. Listens on `http://localhost:3100`. |
| Tempo | `tempo.yaml` | Stores traces. UI/API at `http://localhost:3200`. |
| Promtail | `promtail-config.yaml` | Tails Docker container logs and ships them to Loki. |
| Grafana | provisioned via `grafana/provisioning` | Datasources for Loki, Tempo, Collector metrics pre-loaded. UI on `http://localhost:3001`. |

Bring them up with:

```bash
DOCKER_BUILDKIT=1 docker compose up -d otel-collector loki tempo grafana promtail
```

For detailed usage instructions see `docs/operations/observability.md`.
