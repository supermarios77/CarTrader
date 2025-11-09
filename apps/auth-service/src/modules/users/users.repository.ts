import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export interface UserRecord {
  id: bigint;
  email: string | null;
  phoneE164: string | null;
  displayName: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface CreateUserInput {
  email?: string | null;
  phoneE164?: string | null;
  displayName?: string | null;
}

type PrismaArgs = Record<string, unknown>;

type PrismaUserDelegate = {
  findUnique(args: PrismaArgs): Promise<UserRecord | null>;
  create(args: PrismaArgs): Promise<UserRecord>;
  update(args: PrismaArgs): Promise<UserRecord>;
};

interface PrismaClientLike {
  user: PrismaUserDelegate;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  private get prisma(): PrismaClientLike {
    return this.database.client as unknown as PrismaClientLike;
  }

  async findById(id: bigint): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByPhone(phoneE164: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { phoneE164 } });
  }

  async createUser(payload: CreateUserInput): Promise<UserRecord> {
    return this.prisma.user.create({
      data: {
        email: payload.email ?? null,
        phoneE164: payload.phoneE164 ?? null,
        displayName: payload.displayName ?? null,
      },
    });
  }

  async updateLastLogin(id: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}
