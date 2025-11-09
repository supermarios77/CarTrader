import { config as loadEnvFile } from 'dotenv';
import { z } from 'zod';

import { baseEnvSchema, type BaseEnv } from './schema';

let envLoaded = false;

const ensureEnvLoaded = () => {
  if (!envLoaded) {
    loadEnvFile();
    envLoaded = true;
  }
};

type LoadConfigOptions = {
  env?: Record<string, unknown>;
};

export const loadConfig = <TOutput, TDef extends z.ZodTypeDef, TInput>(
  schema: z.ZodType<TOutput, TDef, TInput>,
  options: LoadConfigOptions = {},
): TOutput => {
  ensureEnvLoaded();

  const envSource: Record<string, unknown> = {
    ...process.env,
    ...(options.env ?? {}),
  };

  return schema.parse(envSource);
};

export const loadBaseConfig = (options: LoadConfigOptions = {}): BaseEnv =>
  loadConfig(baseEnvSchema, options);

export { baseEnvSchema, type BaseEnv, logLevels } from './schema';
