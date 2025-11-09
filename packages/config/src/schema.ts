import { z } from 'zod';

export const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('cartrader'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  LOG_LEVEL: z.enum(logLevels).default('info'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
