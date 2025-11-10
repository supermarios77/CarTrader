import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';

import { loadPaymentsServiceConfig } from '../../config/environment';
import { PaymentEvent } from './entities/payment-intent.entity';

@Controller({ path: 'webhooks', version: '1' })
export class PaymentsWebhookController {
  private readonly config = loadPaymentsServiceConfig();

  private verifySignature(signature: string | undefined): void {
    if (!signature || signature !== this.config.PAYMENTS_WEBHOOK_SECRET) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  @Post('payments')
  handlePaymentsWebhook(@Headers('x-mock-signature') signature: string | undefined, @Body() event: PaymentEvent) {
    this.verifySignature(signature);
    // In the mock implementation we simply acknowledge the event.
    return { received: true, eventId: event.id };
  }
}
