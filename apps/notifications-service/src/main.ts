import { LoggerService, ValidationPipe, VersioningType, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { getLogger } from '@cartrader/logger';

import { AppModule } from './app.module';
import { loadNotificationsConfig } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = loadNotificationsConfig();
  const logger = getLogger();
  app.useLogger(logger as unknown as LoggerService);

  app.setGlobalPrefix(config.NOTIFICATIONS_SERVICE_GLOBAL_PREFIX, {
    exclude: [
      { path: 'healthz', method: RequestMethod.GET },
      { path: 'healthz/ready', method: RequestMethod.GET },
      { path: 'metrics', method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({ type: VersioningType.URI });

  const corsOrigins = config.NOTIFICATIONS_SERVICE_CORS_ORIGINS.split(',').map((origin) => origin.trim());
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

  await app.listen(config.NOTIFICATIONS_SERVICE_PORT);
  logger.info(
    {
      port: config.NOTIFICATIONS_SERVICE_PORT,
      prefix: config.NOTIFICATIONS_SERVICE_GLOBAL_PREFIX,
    },
    'Notifications service ready',
  );
}

void bootstrap();
