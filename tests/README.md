# Test Suite

## Smoke Tests

The smoke test hits each service’s readiness endpoint (and supporting telemetry stack) to verify the running deployment.

### Prerequisites

- Docker compose stack up (all services + observability):

```bash
DOCKER_BUILDKIT=1 docker compose up -d
```

### Run

```bash
pnpm smoke
```

Environment variables allow overriding endpoints, e.g. `SMOKE_API_GATEWAY_URL`, `SMOKE_TIMEOUT_MS`.

Exit code is non-zero if any check fails.
