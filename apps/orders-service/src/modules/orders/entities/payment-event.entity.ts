export interface PaymentIntentPayload {
  id: string;
  orderId: string;
  amountCents: number;
  currency: string;
  customerEmail?: string;
  status: string;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: string;
  type: string;
  data: {
    object: PaymentIntentPayload;
  };
  createdAt: string;
}
