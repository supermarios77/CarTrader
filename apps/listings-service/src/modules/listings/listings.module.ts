import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { AdminListingsController } from './admin-listings.controller';
import { ListingsController } from './listings.controller';
import { ListingsRepository } from './listings.repository';
import { ListingsService } from './listings.service';
import { SearchSyncService } from './search-sync.service';

@Module({
  imports: [DatabaseModule, HttpModule.register({ timeout: 5000, maxRedirects: 0 })],
  controllers: [ListingsController, AdminListingsController],
  providers: [ListingsService, ListingsRepository, SearchSyncService],
  exports: [ListingsService, ListingsRepository, SearchSyncService],
})
export class ListingsModule {}
