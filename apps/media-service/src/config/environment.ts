import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const mediaServiceEnvSchema = baseEnvSchema.extend({
  MEDIA_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3030),
  MEDIA_SERVICE_GLOBAL_PREFIX: z.string().min(1).default('api'),
  MEDIA_SERVICE_CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().min(1),
  MEDIA_S3_ENDPOINT: z.string().url(),
  MEDIA_S3_REGION: z.string().min(1),
  MEDIA_S3_ACCESS_KEY: z.string().min(1),
  MEDIA_S3_SECRET_KEY: z.string().min(1),
  MEDIA_S3_BUCKET: z.string().min(1),
  MEDIA_ASSET_BASE_URL: z.string().url().optional(),
  MEDIA_UPLOAD_URL_TTL: z.coerce.number().int().min(60).max(86400).default(900),
  MEDIA_DOWNLOAD_URL_TTL: z.coerce.number().int().min(60).max(86400).default(3600),
  TRACING_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type MediaServiceEnv = z.infer<typeof mediaServiceEnvSchema>;

export const loadMediaServiceConfig = (): MediaServiceEnv => loadConfig(mediaServiceEnvSchema);
