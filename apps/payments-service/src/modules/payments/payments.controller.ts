import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ConfirmPaymentIntentDto } from './dto/confirm-payment-intent.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RefundPaymentIntentDto } from './dto/refund-payment-intent.dto';
import { PaymentsService } from './payments.service';

@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createIntent(dto);
  }

  @Post('intents/:id/confirm')
  confirmIntent(@Param('id') id: string, @Body() dto: ConfirmPaymentIntentDto) {
    return this.paymentsService.confirmIntent(id, dto);
  }

  @Post('intents/:id/refund')
  refundIntent(@Param('id') id: string, @Body() dto: RefundPaymentIntentDto) {
    return this.paymentsService.refundIntent(id, dto);
  }

  @Get('intents/:id')
  getIntent(@Param('id') id: string) {
    return this.paymentsService.getIntent(id);
  }
}
