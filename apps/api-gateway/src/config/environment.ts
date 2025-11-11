import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const apiGatewayEnvSchema = baseEnvSchema.extend({
  API_GATEWAY_PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  API_GATEWAY_GLOBAL_PREFIX: z.string().min(1).default('api'),
  API_GATEWAY_CORS_ORIGINS: z.string().default('*'),
  LISTINGS_SERVICE_BASE_URL: z.string().url(),
  MEDIA_SERVICE_BASE_URL: z.string().url(),
  NOTIFICATIONS_SERVICE_BASE_URL: z.string().url(),
  ORDERS_SERVICE_BASE_URL: z.string().url(),
  SEARCH_SERVICE_BASE_URL: z.string().url(),
  TRACING_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type ApiGatewayEnv = z.infer<typeof apiGatewayEnvSchema>;

export const loadApiGatewayConfig = (): ApiGatewayEnv => loadConfig(apiGatewayEnvSchema);
