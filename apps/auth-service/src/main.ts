import { LoggerService, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { initTracing } from '@cartrader/observability';
import { getLogger } from '@cartrader/logger';

import { AppModule } from './app.module';
import { loadAuthServiceConfig } from './config/environment';

async function bootstrap(): Promise<void> {
  const config = loadAuthServiceConfig();

  await initTracing({
    serviceName: 'auth-service',
    enabled: config.TRACING_ENABLED,
    exporterEndpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
  });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = getLogger();
  app.useLogger(logger as unknown as LoggerService);

  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(config.AUTH_SERVICE_PORT);
  logger.info({ port: config.AUTH_SERVICE_PORT }, 'Auth service ready');
}

void bootstrap();
