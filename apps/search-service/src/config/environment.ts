import { baseEnvSchema, loadConfig } from '@cartrader/config';
import { z } from 'zod';

const searchEnvSchema = baseEnvSchema.extend({
  SEARCH_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(3050),
  SEARCH_SERVICE_GLOBAL_PREFIX: z.string().min(1).default('api'),
  SEARCH_SERVICE_CORS_ORIGINS: z.string().default('*'),
  OPENSEARCH_NODE: z.string().url(),
  OPENSEARCH_USERNAME: z.string().min(1),
  OPENSEARCH_PASSWORD: z.string().min(1),
  OPENSEARCH_INDEX_LISTINGS: z.string().min(1).default('listings'),
});

export type SearchServiceEnv = z.infer<typeof searchEnvSchema>;

export const loadSearchServiceConfig = (): SearchServiceEnv => loadConfig(searchEnvSchema);
