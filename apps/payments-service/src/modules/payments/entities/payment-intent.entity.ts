export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'requires_refund'
  | 'refunded';

export interface PaymentIntent {
  id: string;
  orderId: string;
  amountCents: number;
  currency: string;
  customerEmail?: string;
  status: PaymentIntentStatus;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentEvent {
  id: string;
  type:
    | 'payment_intent.created'
    | 'payment_intent.processing'
    | 'payment_intent.succeeded'
    | 'payment_intent.failed'
    | 'payment_intent.refund.succeeded';
  data: {
    object: PaymentIntent;
  };
  createdAt: string;
}
