import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, SearchModule],
})
export class AppModule {}
