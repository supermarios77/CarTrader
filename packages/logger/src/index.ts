import pino, {
  type DestinationStream,
  type Logger,
  type LoggerOptions,
  stdTimeFunctions,
} from 'pino';

import { loadBaseConfig, type BaseEnv } from '@cartrader/config';

const baseConfig: BaseEnv = loadBaseConfig();

const buildBaseOptions = (overrides?: LoggerOptions): LoggerOptions => {
  const baseOptions: LoggerOptions = {
    level: baseConfig.LOG_LEVEL,
    base: {
      app: baseConfig.APP_NAME,
      env: baseConfig.NODE_ENV,
    },
    timestamp: stdTimeFunctions.isoTime,
  };

  if (baseConfig.NODE_ENV !== 'production') {
    baseOptions.transport = {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        colorize: true,
        singleLine: false,
      },
    };
  }

  if (!overrides) {
    return baseOptions;
  }

  return {
    ...baseOptions,
    ...overrides,
    base: {
      ...baseOptions.base,
      ...overrides.base,
    },
  } satisfies LoggerOptions;
};

const rootLogger = pino(buildBaseOptions());

export const getLogger = (): Logger => rootLogger;

export const createLogger = (
  overrides?: LoggerOptions,
  destination?: DestinationStream,
): Logger => pino(buildBaseOptions(overrides), destination);

export const createChildLogger = (
  bindings: Parameters<Logger['child']>[0],
  options?: Parameters<Logger['child']>[1],
): Logger => rootLogger.child(bindings, options);

export type { Logger } from 'pino';
