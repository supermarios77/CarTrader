import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const notificationsEnvSchema = baseEnvSchema.extend({
  NOTIFICATIONS_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3040),
  NOTIFICATIONS_SERVICE_GLOBAL_PREFIX: z.string().min(1).default('api'),
  NOTIFICATIONS_SERVICE_CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  NOTIFICATIONS_QUEUE_NAME: z.string().min(1).default('notifications'),
  EMAIL_FROM_ADDRESS: z.string().email(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
});

export type NotificationsEnv = z.infer<typeof notificationsEnvSchema>;

export const loadNotificationsConfig = (): NotificationsEnv => loadConfig(notificationsEnvSchema);
