import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const paymentsEnvSchema = baseEnvSchema.extend({
  PAYMENTS_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3060),
  PAYMENTS_SERVICE_GLOBAL_PREFIX: z.string().min(1).default('api'),
  PAYMENTS_SERVICE_CORS_ORIGINS: z.string().default('*'),
  PAYMENTS_PROVIDER: z.enum(['mock']).default('mock'),
  PAYMENTS_WEBHOOK_SECRET: z.string().min(1).default('mock-webhook-secret'),
  TRACING_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type PaymentsServiceEnv = z.infer<typeof paymentsEnvSchema>;

export const loadPaymentsServiceConfig = (): PaymentsServiceEnv => loadConfig(paymentsEnvSchema);
