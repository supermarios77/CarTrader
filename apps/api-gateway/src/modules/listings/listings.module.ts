import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AdminListingsController } from './admin-listings.controller';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 0,
    }),
  ],
  controllers: [ListingsController, AdminListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
