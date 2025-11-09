import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const authServiceEnvSchema = baseEnvSchema.extend({
  AUTH_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3010),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

export type AuthServiceEnv = z.infer<typeof authServiceEnvSchema>;

export const loadAuthServiceConfig = (): AuthServiceEnv => loadConfig(authServiceEnvSchema);
