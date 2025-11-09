import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { getLogger } from '@cartrader/logger';

import { AppModule } from './app.module';
import { loadApiGatewayConfig } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = loadApiGatewayConfig();
  const logger = getLogger();
  app.useLogger(logger);

  app.setGlobalPrefix(config.API_GATEWAY_GLOBAL_PREFIX, {
    exclude: [{ path: 'healthz', method: 'GET' }],
  });

  app.enableVersioning({ type: VersioningType.URI });

  const corsOrigins = config.API_GATEWAY_CORS_ORIGINS.split(',').map((origin) => origin.trim());
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

  await app.listen(config.API_GATEWAY_PORT);
  logger.info(
    {
      port: config.API_GATEWAY_PORT,
      prefix: config.API_GATEWAY_GLOBAL_PREFIX,
    },
    'API Gateway ready',
  );
}

void bootstrap();
