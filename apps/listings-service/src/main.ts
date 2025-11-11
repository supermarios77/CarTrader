import { LoggerService, ValidationPipe, VersioningType, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { getLogger } from '@cartrader/logger';

import { AppModule } from './app.module';
import { loadListingsServiceConfig } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = loadListingsServiceConfig();
  const logger = getLogger();
  app.useLogger(logger as unknown as LoggerService);

  app.setGlobalPrefix(config.LISTINGS_SERVICE_GLOBAL_PREFIX, {
    exclude: [
      { path: 'healthz', method: RequestMethod.GET },
      { path: 'healthz/ready', method: RequestMethod.GET },
      { path: 'metrics', method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({ type: VersioningType.URI });

  const corsOrigins = config.LISTINGS_SERVICE_CORS_ORIGINS.split(',').map((origin) => origin.trim());
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

  await app.listen(config.LISTINGS_SERVICE_PORT);
  logger.info(
    {
      port: config.LISTINGS_SERVICE_PORT,
      prefix: config.LISTINGS_SERVICE_GLOBAL_PREFIX,
    },
    'Listings service ready',
  );
}

void bootstrap();
