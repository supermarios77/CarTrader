import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const listingsServiceEnvSchema = baseEnvSchema.extend({
  LISTINGS_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3020),
  LISTINGS_SERVICE_GLOBAL_PREFIX: z.string().min(1).default('api'),
  LISTINGS_SERVICE_CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().min(1),
  SEARCH_SERVICE_BASE_URL: z.string().url().default('http://search-service:3050/api/v1'),
  TRACING_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type ListingsServiceEnv = z.infer<typeof listingsServiceEnvSchema>;

export const loadListingsServiceConfig = (): ListingsServiceEnv =>
  loadConfig(listingsServiceEnvSchema);
