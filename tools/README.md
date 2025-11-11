# Tooling

Utility scripts and developer tooling live here. The directory is intentionally lightweight for now; as automation grows, house it alongside documentation so contributors can discover it easily.

## Ideas / WIP

- `release/` – scripts to bump versions, create changelog entries, trigger CI/CD.
- `db/` – automation for seed data, local reset, anonymisation.
- `ops/` – CLI wrappers to interact with observability stack (Loki queries, Tempo search).

If you add a tool:

1. Create a subdirectory (`tools/<name>`).
2. Provide a README describing usage.
3. Wire it into package.json or CI as appropriate.
