import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsModule } from '@cartrader/observability';
import { HealthModule } from './health/health.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, HealthModule, MediaModule],
})
export class AppModule {}
