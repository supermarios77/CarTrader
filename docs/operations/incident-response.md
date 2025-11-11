# Incident Response Playbook

## 1. Detect & Triage

1. Alerts (Grafana/Prometheus) or user reports trigger the incident.
2. Log an entry in the incident tracker (Jira/Notion) with timestamp, reporter, and symptoms.
3. Assign an Incident Commander (IC) and Scribe.
4. Determine severity:
   - **SEV1** – complete outage / data loss
   - **SEV2** – major functionality degraded
   - **SEV3** – partial outage, workaround available
   - **SEV4** – minor issue, monitor only

## 2. Stabilise the System

1. IC coordinates responders in `#incidents` channel.
2. Gather current state:
   - Check service health endpoints (`/healthz`, `/healthz/ready`).
   - Inspect Grafana dashboards (latency, error rate, queue depth).
   - Query logs in Loki with trace correlation (`{traceId="..."}`).
3. Mitigate impact:
   - Roll back to previous container image / config.
   - Scale replicas or disable problematic feature flag.
   - Drain queue traffic if notifications backlog is spiking.

## 3. Communicate

- Internal updates every 15 minutes (`who`, `what`, `status`, `next update`).
- External status page / customer comms for SEV1/SEV2 (template in `/docs/templates/status.md`).

## 4. Resolve

1. Confirm services stable for 30 minutes (success SLO restored, error rate < baseline).
2. Close the incident in tracker.
3. Schedule postmortem within 48 hours.

## 5. Postmortem Checklist

- Timeline (UTC)
- Root cause and contributing factors
- Detection & response gaps
- Action items (assigned & dated)
- Update runbooks / alerts / tests as remediation

## Tooling References

| Task | Command | Notes |
|------|---------|-------|
| Tail logs | `docker compose logs -f <service>` | Local debugging |
| Query logs | Grafana → Explore → Loki | `{service_name="orders-service"}` |
| Inspect traces | Grafana → Explore → Tempo | Filter `service.name` |
| Collector health | `curl http://localhost:13133/healthz` | 200 OK expected |
| Trigger synthetic check | `pnpm --filter @cartrader/api-gateway test` | Placeholder |

## Escalation Contacts

| Role | Primary | Backup |
|------|---------|--------|
| Incident Commander | SRE on-call | Engineering Manager |
| Communications | Product Manager | Support Lead |
| Database | DBRE on-call | Platform Engineer |

Keep this document version-controlled and review quarterly.
