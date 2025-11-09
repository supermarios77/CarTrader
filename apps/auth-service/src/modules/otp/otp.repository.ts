import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export interface OtpChallengeRecord {
  id: bigint;
  contact: string;
  code: string;
  purpose: string;
  expiresAt: Date;
  consumedAt: Date | null;
  userId: bigint | null;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

type PrismaArgs = Record<string, unknown>;

type PrismaOtpChallengeDelegate = {
  create(args: PrismaArgs): Promise<OtpChallengeRecord>;
  findFirst(args: PrismaArgs): Promise<OtpChallengeRecord | null>;
  update(args: PrismaArgs): Promise<OtpChallengeRecord>;
};

interface PrismaClientLike {
  otpChallenge: PrismaOtpChallengeDelegate;
}

@Injectable()
export class OtpRepository {
  constructor(private readonly database: DatabaseService) {}

  private get prisma(): PrismaClientLike {
    return this.database.client as unknown as PrismaClientLike;
  }

  async createChallenge(params: {
    contact: string;
    code: string;
    purpose: string;
    expiresAt: Date;
    userId: bigint | null;
  }): Promise<OtpChallengeRecord> {
    return this.prisma.otpChallenge.create({
      data: {
        contact: params.contact,
        code: params.code,
        purpose: params.purpose,
        expiresAt: params.expiresAt,
        userId: params.userId,
      },
    });
  }

  async findLatestActive(contact: string, purpose: string): Promise<OtpChallengeRecord | null> {
    return this.prisma.otpChallenge.findFirst({
      where: {
        contact,
        purpose,
        consumedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async incrementAttempts(id: bigint): Promise<void> {
    await this.prisma.otpChallenge.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async markConsumed(id: bigint): Promise<OtpChallengeRecord> {
    return this.prisma.otpChallenge.update({
      where: { id },
      data: {
        consumedAt: new Date(),
      },
    });
  }
}
