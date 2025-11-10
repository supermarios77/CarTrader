import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsModule } from '@cartrader/observability';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MetricsModule, HealthModule, NotificationsModule],
})
export class AppModule {}
