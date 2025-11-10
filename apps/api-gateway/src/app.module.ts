import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { ListingsModule } from './modules/listings/listings.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [HealthModule, ListingsModule, MediaModule],
})
export class AppModule {}
