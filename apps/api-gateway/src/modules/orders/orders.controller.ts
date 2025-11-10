import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { OrdersService } from './orders.service';

@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Post(':id/confirm')
  confirmOrder(@Param('id') id: string, @Body() dto: ConfirmOrderDto) {
    return this.ordersService.confirmOrder(id, dto);
  }

  @Post(':id/refund')
  refundOrder(@Param('id') id: string, @Body() dto: RefundOrderDto) {
    return this.ordersService.refundOrder(id, dto);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}
