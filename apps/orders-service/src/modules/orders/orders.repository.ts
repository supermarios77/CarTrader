import type { ListingStatus, Prisma, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

type CreateOrderData = Prisma.OrderUncheckedCreateInput;

type UpdateOrderData = Prisma.OrderUncheckedUpdateInput;


@Injectable()
export class OrdersRepository {
  constructor(private readonly database: DatabaseService) {}

  private get prisma(): PrismaClient {
    return this.database.client as unknown as PrismaClient;
  }

  create(data: CreateOrderData) {
    return this.prisma.order.create({ data });
  }

  update(id: bigint, data: UpdateOrderData) {
    return this.prisma.order.update({ where: { id }, data });
  }

  findById(id: bigint) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  findByPaymentIntentId(paymentIntentId: string) {
    return this.prisma.order.findUnique({ where: { paymentIntentId } });
  }

  listByBuyer(buyerId: bigint, take = 50) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  findListingById(listingId: bigint) {
    return this.prisma.listing.findUnique({ where: { id: listingId } });
  }

  updateListingStatus(listingId: bigint, status: ListingStatus) {
    return this.prisma.listing.update({ where: { id: listingId }, data: { status } });
  }
}
