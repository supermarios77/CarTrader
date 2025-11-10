import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 0,
    }),
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
