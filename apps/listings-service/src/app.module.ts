import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { MetricsModule } from '@cartrader/observability';
import { HealthModule } from './health/health.module';
import { ListingsModule } from './modules/listings/listings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, ScheduleModule.forRoot(), HealthModule, ListingsModule],
})
export class AppModule {}
