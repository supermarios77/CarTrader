import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { getLogger } from '@cartrader/logger';

import { AppModule } from './app.module';
import { loadAuthServiceConfig } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = loadAuthServiceConfig();
  const logger = getLogger();
  app.useLogger(logger);

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
