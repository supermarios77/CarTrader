import { BadRequestException, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

import { createChildLogger } from '@cartrader/logger';

import { OtpRepository, OtpChallengeRecord } from './otp.repository';

export enum OtpPurpose {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA = 'MFA',
}

export interface RequestOtpParams {
  contact: string;
  purpose: OtpPurpose;
  userId: bigint | null;
}

export interface VerifyOtpParams {
  contact: string;
  purpose: OtpPurpose;
  code: string;
}

export interface OtpRequestResult {
  expiresAt: string;
}

@Injectable()
export class OtpService {
  private readonly logger = createChildLogger({ context: OtpService.name });

  constructor(private readonly repository: OtpRepository) {}

  async requestOtp(params: RequestOtpParams): Promise<OtpRequestResult> {
    const code = this.generateCode();
    const expiresAt = this.calculateExpiry();

    const record = await this.repository.createChallenge({
      contact: params.contact,
      code,
      purpose: params.purpose,
      expiresAt,
      userId: params.userId,
    });

    this.logger.info(
      {
        contact: params.contact,
        purpose: params.purpose,
        challengeId: record.id.toString(),
        expiresAt: expiresAt.toISOString(),
      },
      'OTP challenge created',
    );

    // Integration with delivery providers (email/SMS) will be added later.
    return {
      expiresAt: expiresAt.toISOString(),
    };
  }

  async verifyOtp(params: VerifyOtpParams): Promise<OtpChallengeRecord> {
    const challenge = await this.repository.findLatestActive(params.contact, params.purpose);

    if (!challenge) {
      throw new BadRequestException('No active OTP challenge found.');
    }

    if (challenge.consumedAt) {
      throw new BadRequestException('OTP code has already been used.');
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP code has expired.');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new BadRequestException('Maximum OTP attempts exceeded.');
    }

    if (challenge.code !== params.code) {
      await this.repository.incrementAttempts(challenge.id);
      throw new BadRequestException('Invalid OTP code.');
    }

    return this.repository.markConsumed(challenge.id);
  }

  private generateCode(): string {
    return randomInt(100000, 999999).toString();
  }

  private calculateExpiry(): Date {
    return new Date(Date.now() + 5 * 60 * 1000);
  }
}
