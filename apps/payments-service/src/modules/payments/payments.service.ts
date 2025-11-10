import { Injectable } from '@nestjs/common';

import { MockPaymentsProvider } from './providers/mock-provider';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentIntentDto } from './dto/confirm-payment-intent.dto';
import { RefundPaymentIntentDto } from './dto/refund-payment-intent.dto';
import { PaymentEvent, PaymentIntent } from './entities/payment-intent.entity';

@Injectable()
export class PaymentsService {
  constructor(private readonly mockProvider: MockPaymentsProvider) {}

  async createIntent(dto: CreatePaymentIntentDto): Promise<{ intent: PaymentIntent; event: PaymentEvent }> {
    return this.mockProvider.createIntent(dto);
  }

  async confirmIntent(intentId: string, dto: ConfirmPaymentIntentDto): Promise<{ intent: PaymentIntent; events: PaymentEvent[] }> {
    return this.mockProvider.confirmIntent(intentId, dto.paymentMethodId);
  }

  async refundIntent(intentId: string, dto: RefundPaymentIntentDto): Promise<{ intent: PaymentIntent; event: PaymentEvent }> {
    return this.mockProvider.refundIntent(intentId, dto.amountCents);
  }

  async getIntent(intentId: string): Promise<PaymentIntent | null> {
    return this.mockProvider.getIntent(intentId);
  }
}
