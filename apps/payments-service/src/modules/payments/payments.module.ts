import { Module } from '@nestjs/common';

import { PaymentsController } from './payments.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { PaymentsService } from './payments.service';
import { MockPaymentsProvider } from './providers/mock-provider';

@Module({
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [PaymentsService, MockPaymentsProvider],
})
export class PaymentsModule {}
