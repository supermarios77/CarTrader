export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface OrderSummary {
  id: string;
  listingId: string;
  buyerId?: string | null;
  paymentIntentId: string;
  amountCents: number;
  currencyCode: string;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}
