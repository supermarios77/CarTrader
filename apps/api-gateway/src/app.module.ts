import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { ListingsModule } from './modules/listings/listings.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [HealthModule, ListingsModule, MediaModule, NotificationsModule, SearchModule],
})
export class AppModule {}
