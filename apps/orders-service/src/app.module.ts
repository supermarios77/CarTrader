import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsModule } from '@cartrader/observability';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, HealthModule, OrdersModule],
})
export class AppModule {}
