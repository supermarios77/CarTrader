# Documentation Hub

This folder collects living documentation for the CarTrader backend.

## Contents

| File | Purpose |
|------|---------|
| `operations/observability.md` | How to run and use the Grafana/Loki/Tempo/OTEL stack. |
| `operations/deployment.md` | CI/CD pipeline, release flow, secrets management. |
| `operations/incident-response.md` | Incident handling playbook, severities, communications. |
| `operations/backups.md` | Backup/restore procedures for Postgres, MinIO, OpenSearch. |

## Contributing to docs

- Prefer markdown (`.md`) files alongside relevant code when possible.
- Keep runbooks concise and actionable (checklists, commands, escalation paths).
- For architecture decisions, add ADRs under `docs/architecture/` (create folder if needed).

Whenever a new operational or architectural practice is established, document it here and reference it from `README.md` or `ops/README.md` to keep onboarding smooth.
