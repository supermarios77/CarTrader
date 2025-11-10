import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, OrdersModule],
})
export class AppModule {}
