import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthModule } from './health/health.module';
import { ListingsModule } from './modules/listings/listings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot(), HealthModule, ListingsModule],
})
export class AppModule {}
