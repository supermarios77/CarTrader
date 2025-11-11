# Shared Packages

Reusable libraries available to the services in `apps/`.

| Package | Description |
|---------|-------------|
| `@cartrader/config` | Zod-powered environment loader + base schema (`NODE_ENV`, `APP_NAME`, etc.). |
| `@cartrader/database` | Prisma client factory with shared instantiation helpers. |
| `@cartrader/logger` | Pino wrapper with standardized base fields + OTEL trace correlation. |
| `@cartrader/observability` | Metrics module (Prometheus + Nest interceptor) and tracing bootstrap helper. |

## Adding a new package

1. `pnpm init --filter packages/<name>` (or copy an existing package manifest).
2. Add entry to `pnpm-workspace.yaml` if needed (wildcard already captures `packages/*`).
3. Create `tsconfig.json` extending `../../tsconfig.base.json`.
4. Export public API via `src/index.ts`; ensure `build`, `lint`, `typecheck` scripts exist.
5. Reference from services with `pnpm add <new-package> --filter <service>`.

Packages should remain framework-agnostic when possible (e.g. avoid Nest imports unless the package is purpose-built for Nest integrations).
