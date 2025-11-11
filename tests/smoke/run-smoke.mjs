#!/usr/bin/env node

const services = [
  { name: 'api-gateway', envVar: 'SMOKE_API_GATEWAY_URL', defaultUrl: 'http://localhost:3000/healthz/ready' },
  { name: 'auth-service', envVar: 'SMOKE_AUTH_SERVICE_URL', defaultUrl: 'http://localhost:3010/healthz/ready' },
  { name: 'listings-service', envVar: 'SMOKE_LISTINGS_SERVICE_URL', defaultUrl: 'http://localhost:3020/healthz/ready' },
  { name: 'media-service', envVar: 'SMOKE_MEDIA_SERVICE_URL', defaultUrl: 'http://localhost:3030/healthz/ready' },
  { name: 'notifications-service', envVar: 'SMOKE_NOTIFICATIONS_SERVICE_URL', defaultUrl: 'http://localhost:3040/healthz/ready' },
  { name: 'search-service', envVar: 'SMOKE_SEARCH_SERVICE_URL', defaultUrl: 'http://localhost:3050/healthz/ready' },
  { name: 'payments-service', envVar: 'SMOKE_PAYMENTS_SERVICE_URL', defaultUrl: 'http://localhost:3060/healthz/ready' },
  { name: 'orders-service', envVar: 'SMOKE_ORDERS_SERVICE_URL', defaultUrl: 'http://localhost:3070/healthz/ready' },
  { name: 'otel-collector', envVar: 'SMOKE_OTEL_COLLECTOR_URL', defaultUrl: 'http://localhost:13133/healthz' },
  { name: 'grafana', envVar: 'SMOKE_GRAFANA_URL', defaultUrl: 'http://localhost:3001/api/health' },
];

const TIMEOUT = Number(process.env.SMOKE_TIMEOUT_MS ?? 5000);

async function checkService({ name, envVar, defaultUrl }) {
  const url = process.env[envVar] ?? defaultUrl;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let body;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      body = await response.json();
      if (body?.status && body.status !== 'ok') {
        throw new Error(`Status field is ${body.status}`);
      }
    } else {
      body = await response.text();
    }

    return { name, url, ok: true, body };
  } catch (error) {
    return { name, url, ok: false, error };
  } finally {
    clearTimeout(timeoutId);
  }
}

(async () => {
  console.log('Running smoke checks...');

  const results = await Promise.all(services.map(checkService));

  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    if (result.ok) {
      console.log(`✅  ${result.name} – ${result.url}`);
    } else {
      console.error(`❌  ${result.name} – ${result.url}`);
      console.error(`    ${result.error instanceof Error ? result.error.message : String(result.error)}`);
    }
  }

  if (failures.length > 0) {
    console.error(`Smoke checks failed (${failures.length}/${services.length}).`);
    process.exitCode = 1;
    return;
  }

  console.log(`All ${services.length} services responded successfully.`);
})();
