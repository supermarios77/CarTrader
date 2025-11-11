# Operations Guide

This directory contains runbooks, infrastructure manifests, and tooling to operate the CarTrader backend.

## Quick Links

- [Observability configs](./observability/README.md) – local Grafana/Loki/Tempo/OTel Collector definitions.
- [Observability runbook](../docs/operations/observability.md) – how to use the telemetry stack day-to-day.
- [Deployment runbook](../docs/operations/deployment.md) – CI/CD, release flow, environment promotion.
- [Incident response](../docs/operations/incident-response.md) – escalation matrix, rollback steps.
- [Backup & restore](../docs/operations/backups.md) – database, object storage, search index retention plans.

## Local Ops

- `docker compose up otel-collector loki tempo grafana promtail` – bring up telemetry backbone.
- `docker compose up api-gateway <service>` – run API stack with tracing/log streaming wired to the collector.
- Grafana: http://localhost:3001 (admin / admin)
- Prometheus scrape endpoint exposed by the collector: http://localhost:8889/metrics
- Loki push endpoint: http://localhost:3100
- Tempo API: http://localhost:3200

## Conventions

- Environment variables live in `apps/*/src/config/environment.ts` and are validated with Zod.
- Every service logs JSON to stdout; Promtail ships container logs to Loki.
- OpenTelemetry is optional per service – toggle with `TRACING_ENABLED` and configure the collector endpoint via `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Secrets must be stored in the target environment’s secret manager (see deployment runbook).
