import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { ListingsModule } from './modules/listings/listings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, ListingsModule],
})
export class AppModule {}
