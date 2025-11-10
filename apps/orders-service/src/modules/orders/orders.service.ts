import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { OrdersRepository, OrderStatus } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { OrderSummary } from './entities/order.entity';
import { PaymentEvent, PaymentIntentPayload } from './entities/payment-event.entity';
import { OrdersServiceEnv } from '../../config/environment';

interface PaymentResponse {
  intent: PaymentIntentPayload;
  event?: PaymentEvent;
  events?: PaymentEvent[];
}

@Injectable()
export class OrdersService {
  private readonly logger = createChildLogger({ context: OrdersService.name });
  private readonly paymentsBaseUrl: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly configService: ConfigService<OrdersServiceEnv>,
    private readonly httpService: HttpService,
  ) {
    const baseUrl = this.configService.get('PAYMENTS_SERVICE_BASE_URL', { infer: true });
    if (!baseUrl) {
      throw new Error('PAYMENTS_SERVICE_BASE_URL is not configured');
    }

    this.paymentsBaseUrl = baseUrl.replace(/\/$/, '');
    this.webhookSecret = this.configService.get('PAYMENTS_WEBHOOK_SECRET', { infer: true }) ?? 'mock-webhook-secret';
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderSummary> {
    const listingId = this.parseBigInt(dto.listingId, 'listingId');
    const listing = await this.ordersRepository.findListingById(listingId);

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== 'PUBLISHED') {
      throw new BadRequestException('Listing is not available for purchase');
    }

    const buyerId = dto.buyerId ? this.parseBigInt(dto.buyerId, 'buyerId') : null;
    const amountCents = listing.priceCents;
    const currency = listing.currencyCode ?? 'PKR';

    const paymentResponse = await this.callPaymentsService<PaymentResponse>('post', '/intents', {
      orderId: listing.id.toString(),
      amountCents: Number(amountCents),
      currency,
      customerEmail: dto.customerEmail,
    });

    const intent = paymentResponse.intent;

    const orderRecord = await this.ordersRepository.create({
      listingId,
      buyerId: buyerId ?? null,
      paymentIntentId: intent.id,
      amountCents: BigInt(intent.amountCents ?? Number(amountCents)),
      currencyCode: currency,
      paymentStatus: intent.status,
      status: 'PENDING_PAYMENT',
    });

    return this.toOrderSummary(orderRecord);
  }

  async confirmOrder(orderId: string, dto: ConfirmOrderDto): Promise<OrderSummary> {
    const order = await this.getOrderRecord(orderId);

    const paymentResponse = await this.callPaymentsService<PaymentResponse>(
      'post',
      `/intents/${order.paymentIntentId}/confirm`,
      dto.paymentMethodId ? { paymentMethodId: dto.paymentMethodId } : undefined,
    );

    return this.applyPaymentUpdate(order.id, order.listingId, paymentResponse);
  }

  async refundOrder(orderId: string, dto: RefundOrderDto): Promise<OrderSummary> {
    const order = await this.getOrderRecord(orderId);

    const paymentResponse = await this.callPaymentsService<PaymentResponse>('post', `/intents/${order.paymentIntentId}/refund`, {
      amountCents: dto.amountCents,
      reason: dto.reason,
    });

    return this.applyPaymentUpdate(order.id, order.listingId, paymentResponse);
  }

  async getOrder(orderId: string): Promise<OrderSummary> {
    const order = await this.getOrderRecord(orderId);
    return this.toOrderSummary(order);
  }

  async handleWebhook(event: PaymentEvent, signature: string | undefined): Promise<void> {
    if (!signature || signature !== this.webhookSecret) {
      throw new BadRequestException('Invalid signature');
    }

    const intent = event.data.object;
    const order = await this.ordersRepository.findByPaymentIntentId(intent.id);

    if (!order) {
      this.logger.warn({ paymentIntentId: intent.id }, 'Order not found for payment intent');
      return;
    }

    await this.applyPaymentUpdate(order.id, order.listingId, { intent, event });
  }

  private async applyPaymentUpdate(orderId: bigint, listingId: bigint, response: PaymentResponse): Promise<OrderSummary> {
    const intent = response.intent;
    const nextStatus = this.mapPaymentStatusToOrderStatus(intent.status);

    const updatedOrder = await this.ordersRepository.update(orderId, {
      paymentStatus: intent.status,
      status: nextStatus,
    });

    if (nextStatus === 'PAID') {
      await this.ordersRepository.updateListingStatus(listingId, 'SOLD');
    } else if (nextStatus === 'REFUNDED') {
      await this.ordersRepository.updateListingStatus(listingId, 'ARCHIVED');
    }

    return this.toOrderSummary(updatedOrder);
  }

  private async getOrderRecord(orderId: string) {
    const id = this.parseBigInt(orderId, 'orderId');
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private async callPaymentsService<T>(method: 'post' | 'get', path: string, payload?: unknown): Promise<T> {
    const url = `${this.paymentsBaseUrl}${path}`;

    const request = method === 'post'
      ? this.httpService.post<T>(url, payload, {
          headers: {
            'x-mock-signature': this.webhookSecret,
          },
        })
      : this.httpService.get<T>(url, {
          headers: {
            'x-mock-signature': this.webhookSecret,
          },
        });

    const response = await firstValueFrom(request);
    return response.data;
  }

  private mapPaymentStatusToOrderStatus(paymentStatus: string): OrderStatus {
    switch (paymentStatus) {
      case 'processing':
        return 'PROCESSING';
      case 'succeeded':
        return 'PAID';
      case 'requires_confirmation':
      case 'requires_payment_method':
        return 'PENDING_PAYMENT';
      case 'requires_refund':
        return 'REFUND_PENDING';
      case 'refunded':
        return 'REFUNDED';
      default:
        return 'PENDING_PAYMENT';
    }
  }

  private toOrderSummary(order: {
    id: bigint;
    listingId: bigint;
    buyerId?: bigint | null;
    paymentIntentId: string;
    amountCents: bigint;
    currencyCode: string;
    status: string;
    paymentStatus: string;
    createdAt: Date;
    updatedAt: Date;
  }): OrderSummary {
    return {
      id: order.id.toString(),
      listingId: order.listingId.toString(),
      buyerId: order.buyerId ? order.buyerId.toString() : null,
      paymentIntentId: order.paymentIntentId,
      amountCents: Number(order.amountCents),
      currencyCode: order.currencyCode,
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private parseBigInt(value: string, field: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`${field} is not a valid identifier`);
    }
  }
}
