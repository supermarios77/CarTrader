import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { loadApiGatewayConfig } from '../../config/environment';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';

export interface OrderSummary {
  id: string;
  listingId: string;
  buyerId?: string | null;
  paymentIntentId: string;
  amountCents: number;
  currencyCode: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = createChildLogger({ context: OrdersService.name });
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    const { ORDERS_SERVICE_BASE_URL } = loadApiGatewayConfig();
    this.baseUrl = ORDERS_SERVICE_BASE_URL.replace(/\/$/, '');
  }

  createOrder(dto: CreateOrderDto): Promise<OrderSummary> {
    return this.request<OrderSummary>('post', '/v1/orders', dto);
  }

  confirmOrder(id: string, dto: ConfirmOrderDto): Promise<OrderSummary> {
    return this.request<OrderSummary>('post', `/v1/orders/${id}/confirm`, dto);
  }

  refundOrder(id: string, dto: RefundOrderDto): Promise<OrderSummary> {
    return this.request<OrderSummary>('post', `/v1/orders/${id}/refund`, dto);
  }

  getOrder(id: string): Promise<OrderSummary> {
    return this.request<OrderSummary>('get', `/v1/orders/${id}`);
  }

  private async request<T>(method: 'get' | 'post', path: string, payload?: unknown): Promise<T> {
    try {
      const url = `${this.baseUrl}${path}`;
      const response = method === 'post'
        ? await firstValueFrom(this.http.post<T>(url, payload))
        : await firstValueFrom(this.http.get<T>(url));

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (this.isAxiosErrorShape(error)) {
      const status =
        typeof error.response?.status === 'number' ? error.response.status : HttpStatus.BAD_GATEWAY;
      const payload = error.response?.data ?? error.message;

      this.logger.warn(
        {
          status,
          message: error.message,
          response: payload,
          url: error.config?.url,
          method: error.config?.method,
        },
        'Orders service request failed',
      );

      if (typeof payload === 'string') {
        return new HttpException(payload, status);
      }

      if (payload && typeof payload === 'object') {
        return new HttpException(payload as Record<string, unknown>, status);
      }

      return new HttpException(error.message ?? 'Orders service error', status);
    }

    this.logger.error({ error }, 'Unexpected error proxying orders request');
    return new HttpException('Upstream service error', HttpStatus.BAD_GATEWAY);
  }

  private isAxiosErrorShape(error: unknown): error is {
    isAxiosError?: boolean;
    response?: { status?: number; data?: unknown };
    message: string;
    config?: { url?: string; method?: string };
  } {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as {
      isAxiosError?: boolean;
      response?: { status?: number; data?: unknown };
      message?: unknown;
    };

    return candidate.isAxiosError === true && typeof candidate.message === 'string';
  }
}
