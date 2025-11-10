import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import {
  createPrismaClient,
  disconnectPrismaClient,
  getPrismaClient,
  PrismaClientInstance,
  PrismaClientOptions,
} from '@cartrader/database';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClientInstance | null = null;

  get client(): PrismaClientInstance {
    if (!this.prisma) {
      this.prisma = getPrismaClient();
    }

    return this.prisma;
  }

  createClient(options?: PrismaClientOptions): PrismaClientInstance {
    this.prisma = createPrismaClient(options);
    return this.prisma;
  }

  async onModuleInit(): Promise<void> {
    const prisma = this.client;
    if (typeof prisma.$connect === 'function') {
      await prisma.$connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await disconnectPrismaClient();
    this.prisma = null;
  }
}
