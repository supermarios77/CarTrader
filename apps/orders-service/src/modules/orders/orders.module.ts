import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  imports: [HttpModule.register({ timeout: 5000, maxRedirects: 0 }), DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
