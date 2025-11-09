import pino, {
  type DestinationStream,
  type Logger,
  type LoggerOptions,
  stdTimeFunctions,
} from 'pino';

import { loadBaseConfig, type BaseEnv } from '@cartrader/config';

export type AppLogger = Logger<string>;

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

const rootLogger = pino(buildBaseOptions()) as unknown as AppLogger;

export const getLogger = (): AppLogger => rootLogger;

export const createLogger = (
  overrides?: LoggerOptions,
  destination?: DestinationStream,
): AppLogger => pino(buildBaseOptions(overrides), destination) as unknown as AppLogger;

export const createChildLogger = (
  bindings: Parameters<AppLogger['child']>[0],
  options?: Parameters<AppLogger['child']>[1],
): AppLogger => rootLogger.child(bindings, options);

export type { LoggerOptions };
