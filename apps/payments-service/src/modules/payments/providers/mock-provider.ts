import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { createChildLogger } from '@cartrader/logger';

import { PaymentIntent, PaymentIntentStatus, PaymentEvent } from '../entities/payment-intent.entity';

type PaymentIntentRecord = PaymentIntent;

@Injectable()
export class MockPaymentsProvider {
  private readonly logger = createChildLogger({ context: MockPaymentsProvider.name });
  private readonly intents = new Map<string, PaymentIntentRecord>();

  createIntent(params: {
    orderId: string;
    amountCents: number;
    currency: string;
    customerEmail?: string;
  }): Promise<{ intent: PaymentIntent; event: PaymentEvent }> {
    const now = new Date().toISOString();
    const intent: PaymentIntentRecord = {
      id: randomUUID(),
      orderId: params.orderId,
      amountCents: params.amountCents,
      currency: params.currency,
      customerEmail: params.customerEmail,
      status: 'requires_payment_method',
      createdAt: now,
      updatedAt: now,
    };

    this.intents.set(intent.id, intent);
    this.logger.info({ intentId: intent.id }, 'Mock payment intent created');

    return Promise.resolve({
      intent,
      event: this.buildEvent('payment_intent.created', intent),
    });
  }

  confirmIntent(intentId: string, paymentMethodId?: string): Promise<{ intent: PaymentIntent; events: PaymentEvent[] }> {
    const intent = this.getIntentOrThrow(intentId);

    const updates: PaymentIntentRecord[] = [];
    const events: PaymentEvent[] = [];

    const processing = this.updateIntent(intent, {
      status: 'processing',
      paymentMethodId: paymentMethodId ?? `mock_pm_${intentId}`,
    });
    updates.push(processing);
    events.push(this.buildEvent('payment_intent.processing', processing));

    const succeeded = this.updateIntent(processing, {
      status: 'succeeded',
    });
    updates.push(succeeded);
    events.push(this.buildEvent('payment_intent.succeeded', succeeded));

    updates.forEach((record) => this.intents.set(record.id, record));

    return Promise.resolve({
      intent: succeeded,
      events,
    });
  }

  refundIntent(intentId: string, amountCents?: number): Promise<{ intent: PaymentIntent; event: PaymentEvent }> {
    const intent = this.getIntentOrThrow(intentId);

    const refundStatus: PaymentIntentStatus = amountCents && amountCents < intent.amountCents ? 'requires_refund' : 'refunded';
    const updated = this.updateIntent(intent, {
      status: refundStatus,
    });

    this.intents.set(updated.id, updated);

    return Promise.resolve({
      intent: updated,
      event: this.buildEvent('payment_intent.refund.succeeded', updated),
    });
  }

  getIntent(intentId: string): Promise<PaymentIntent | null> {
    return Promise.resolve(this.intents.get(intentId) ?? null);
  }

  private getIntentOrThrow(intentId: string): PaymentIntentRecord {
    const intent = this.intents.get(intentId);
    if (!intent) {
      this.logger.warn({ intentId }, 'Payment intent not found');
      throw new Error('Payment intent not found');
    }

    return intent;
  }

  private updateIntent(intent: PaymentIntentRecord, updates: Partial<PaymentIntentRecord>): PaymentIntentRecord {
    const updated: PaymentIntentRecord = {
      ...intent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return updated;
  }

  private buildEvent(type: PaymentEvent['type'], intent: PaymentIntent): PaymentEvent {
    return {
      id: randomUUID(),
      type,
      data: {
        object: intent,
      },
      createdAt: new Date().toISOString(),
    };
  }
}
