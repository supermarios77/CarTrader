# Infrastructure

Infrastructure-as-code assets live here. The current backend MVP relies on `docker-compose.yml` for local orchestration; production provisioning will be captured in this directory.

## Roadmap

- Terraform modules for:
  - VPC / networking
  - Managed Postgres (RDS/Cloud SQL)
  - Object storage buckets (S3/GCS)
  - OpenSearch / ElasticSearch clusters
  - OTEL Collector (ECS/Kubernetes DaemonSet) & Grafana (managed/cloud)
- Helm charts / Kustomize overlays for NestJS services.
- GitOps manifests (ArgoCD/Flux) for automated deploys.

## Contributing

1. Create a subfolder per stack (e.g. `terraform/aws`, `helm/`, `k8s/overlays`).
2. Document prerequisites and apply/destroy commands.
3. Keep secrets out of source control; rely on secret managers referenced via variables.

Until IaC is checked in, refer to `docs/operations/deployment.md` for deployment steps.
