import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsModule } from '@cartrader/observability';
import { HealthModule } from './health/health.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, HealthModule, PaymentsModule],
})
export class AppModule {}
