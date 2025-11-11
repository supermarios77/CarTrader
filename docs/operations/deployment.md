# Deployment Runbook

## CI pipeline (GitHub Actions)

The workflow in `.github/workflows/ci.yml` runs on every push/PR:

1. Checkout & install Node.js 20 / pnpm 9
2. `pnpm install --frozen-lockfile`
3. `pnpm lint` → drives Turbo to lint every package
4. `pnpm test` → placeholder (fill once tests exist)
5. `pnpm build` → runs `turbo run build`

### Extending CI

- Add `pnpm prisma generate` if new Prisma clients are introduced.
- Add security scanning (`pnpm audit`, Trivy, etc.).
- Publish container images via `docker/build-push-action` on `main` after lint/build pass.

## CD workflow

Recommended approach:

1. Feature branch → PR → CI green → merge to `main`.
2. Tag release (`vX.Y.Z`).
3. CI job builds images (`apps/*/Dockerfile`) with tag `registry/cartrader/<service>:<tag>` and pushes to registry (ECR/GCR/ACR).
4. CD pipeline (ArgoCD, Flux, GitHub Actions environment) updates deployment manifests referencing new tag.

## Environments

| Environment | Branch | Notes |
|-------------|--------|-------|
| `dev` | feature branches via `docker-compose` | Local stack w/ OTEL, Loki, Tempo |
| `staging` | `main` | Smoke tests, synthetic traffic |
| `prod` | tags | Blue/green or rolling deploy |

## Secrets & Config

- Use AWS SSM Parameter Store / Azure KeyVault / GCP Secret Manager in non-local envs.
- Map secrets to the environment variables enforced by Zod schemas in `apps/*/src/config/environment.ts`.
- Do **not** commit `.env` files; use `dotenv` only for local development.

## Database migrations

1. Generate migration locally (`pnpm prisma migrate dev`).
2. Commit migration SQL under `packages/database/prisma/migrations`.
3. CI runs `prisma migrate diff` (optional) to validate.
4. Deployment pipeline executes `pnpm prisma migrate deploy` against target DB before rolling out services.

## Rollbacks

- Container images are immutable; redeploy previous tag.
- Database schema rollbacks require manual SQL or feature flags—documented per migration.

## Checklist before release

- [ ] CI green.
- [ ] Prisma migrations reviewed.
- [ ] Secrets present in target environment.
- [ ] Observability stack receiving data (health check collector, logs, traces).
- [ ] Run `docker compose up` locally for smoke testing.
