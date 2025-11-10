import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsModule } from '@cartrader/observability';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, HealthModule, AuthModule],
})
export class AppModule {}
