import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsModule } from '@cartrader/observability';
import { HealthModule } from './health/health.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, HealthModule, SearchModule],
})
export class AppModule {}
