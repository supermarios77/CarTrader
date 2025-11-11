import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const authServiceEnvSchema = baseEnvSchema.extend({
  AUTH_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3010),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_JWT_SECRET: z.string().min(32, 'AUTH_JWT_SECRET must be at least 32 characters'),
  AUTH_JWT_EXPIRES_IN: z.string().default('15m'),
  AUTH_REFRESH_SECRET: z.string().min(32, 'AUTH_REFRESH_SECRET must be at least 32 characters'),
  AUTH_REFRESH_EXPIRES_IN: z.string().default('30d'),
  TRACING_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type AuthServiceEnv = z.infer<typeof authServiceEnvSchema>;

export const loadAuthServiceConfig = (): AuthServiceEnv => loadConfig(authServiceEnvSchema);
