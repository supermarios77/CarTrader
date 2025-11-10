import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const ordersEnvSchema = baseEnvSchema.extend({
  ORDERS_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3070),
  ORDERS_SERVICE_GLOBAL_PREFIX: z.string().min(1).default('api'),
  ORDERS_SERVICE_CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().min(1),
  PAYMENTS_SERVICE_BASE_URL: z.string().url().default('http://payments-service:3060/api/v1'),
  PAYMENTS_WEBHOOK_SECRET: z.string().min(1).default('mock-webhook-secret'),
});

export type OrdersServiceEnv = z.infer<typeof ordersEnvSchema>;

export const loadOrdersServiceConfig = (): OrdersServiceEnv => loadConfig(ordersEnvSchema);
