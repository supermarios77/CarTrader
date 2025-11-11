import { LoggerService, ValidationPipe, VersioningType, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { initTracing } from '@cartrader/observability';
import { getLogger } from '@cartrader/logger';

import { AppModule } from './app.module';
import { loadPaymentsServiceConfig } from './config/environment';

async function bootstrap(): Promise<void> {
  const config = loadPaymentsServiceConfig();

  await initTracing({
    serviceName: 'payments-service',
    enabled: config.TRACING_ENABLED,
    exporterEndpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
  });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = getLogger();
  app.useLogger(logger as unknown as LoggerService);

  app.setGlobalPrefix(config.PAYMENTS_SERVICE_GLOBAL_PREFIX, {
    exclude: [
      { path: 'healthz', method: RequestMethod.GET },
      { path: 'healthz/ready', method: RequestMethod.GET },
      { path: 'metrics', method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({ type: VersioningType.URI });

  const corsOrigins = config.PAYMENTS_SERVICE_CORS_ORIGINS.split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(config.PAYMENTS_SERVICE_PORT);
  logger.info(
    {
      port: config.PAYMENTS_SERVICE_PORT,
      prefix: config.PAYMENTS_SERVICE_GLOBAL_PREFIX,
    },
    'Payments service ready',
  );
}

void bootstrap();
