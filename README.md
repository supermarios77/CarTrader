# CarTrader Platform Backend

Production-ready MVP backend for the CarTrader marketplace. The repository is a PNPM/Turborepo monorepo that houses service code, shared packages, operations runbooks, and local infrastructure.

## Monorepo layout

| Path | Description |
|------|-------------|
| `apps/` | NestJS services: API gateway, auth, listings, media, notifications, orders, payments (mock), search. |
| `packages/` | Shared libraries (`config`, `database`, `logger`, `observability`). |
| `docs/` | Living documentation – architecture notes, operations runbooks, deployment guidance. |
| `ops/` | Operational assets (OTEL collector/Loki/Tempo/Grafana configs, incident/backups runbooks). |
| `infra/` | Infrastructure as code (placeholder, reserved for Terraform/Helm). |
| `tools/` | Developer tooling / automation scripts (to be expanded). |
| `tests/` | Cross-service tests (currently smoke tests). |

## Prerequisites

- Node.js **20.x**
- pnpm **9.x**
- Docker (for local compose stack)
- Make sure `corepack enable` has been run so pnpm is available.

## First-time setup

```bash
pnpm install
# Optional: generate Prisma clients if database schema changes
pnpm --filter @cartrader/database prisma generate
```

## Running the stack locally

```bash
DOCKER_BUILDKIT=1 docker compose up -d
# API gateway available at http://localhost:3000
# Grafana (observability) at http://localhost:3001 (admin / admin)
```

Services emit structured JSON logs enriched with OpenTelemetry trace/span IDs. The provided compose file also starts the telemetry backbone (OTEL Collector, Loki, Tempo, Promtail, Grafana).

Language service specific environment variables are validated via Zod in `apps/*/src/config/environment.ts`.

## Development workflow

- `pnpm dev` – (once frontend exists) run dev pipelines via Turborepo.
- `pnpm lint` – Lint all packages/services.
- `pnpm build` – Type-check & build all services.
- `pnpm test` – Placeholder for unit/integration tests.
- `pnpm smoke` – Hit every service readiness endpoint (requires compose stack up).

### Smoke test output

```
Running smoke checks...
✅  api-gateway – http://localhost:3000/healthz/ready
...
All 10 services responded successfully.
```

## Observability

- OTEL Collector: http://localhost:13133/healthz
- Prometheus scrape: http://localhost:8889/metrics
- Loki REST API: http://localhost:3100
- Tempo traces: http://localhost:3200
- Grafana: http://localhost:3001 (datasources pre-provisioned)

See `docs/operations/observability.md` for detailed instructions.

## Deployment & operations

- CI pipeline definition: `.github/workflows/ci.yml`
- Runbooks: `docs/operations/` (deployment, incident response, backups)
- Local ops quick links: `ops/README.md`

## Contributing

1. `git checkout -b feature/<name>`
2. Make changes + add unit/integration tests.
3. `pnpm lint && pnpm build && pnpm smoke`
4. Commit with conventional-friendly message (emojis optional 😉).
5. Open PR targeting `main`.
