import { BadRequestException, Injectable } from '@nestjs/common';

import { createChildLogger } from '@cartrader/logger';

import { UsersService, PublicUser } from '../users/users.service';
import type { UserRecord } from '../users/users.service';
import { OtpPurpose, OtpService } from '../otp/otp.service';
import { TokensService, GeneratedTokens } from '../tokens/tokens.service';

import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

export interface VerifyOtpResult {
  user: PublicUser;
  tokens: GeneratedTokens;
}

type ContactType = 'EMAIL' | 'PHONE';

@Injectable()
export class AuthService {
  private readonly logger = createChildLogger({ context: AuthService.name });

  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly tokensService: TokensService,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<{ expiresAt: string }> {
    const { contact, contactType } = this.resolveContact(dto.email, dto.phone);
    const purpose = dto.purpose;

    let user: UserRecord | null = null;

    if (contactType === 'EMAIL') {
      user = await this.usersService.findByEmail(contact);
    } else {
      user = await this.usersService.findByPhone(contact);
    }

    if (purpose === OtpPurpose.SIGN_IN || purpose === OtpPurpose.PASSWORD_RESET) {
      if (!user) {
        throw new BadRequestException('No account exists for the provided contact.');
      }
    }

    if (purpose === OtpPurpose.SIGN_UP && user) {
      throw new BadRequestException('An account already exists for this contact.');
    }

    if (!user && purpose === OtpPurpose.SIGN_UP) {
      user = await this.usersService.createExplicitUser({
        email: contactType === 'EMAIL' ? contact : undefined,
        phoneE164: contactType === 'PHONE' ? contact : undefined,
      });
    }

    return this.otpService.requestOtp({
      contact,
      purpose,
      userId: user ? user.id : null,
    });
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResult> {
    const { contact, contactType } = this.resolveContact(dto.email, dto.phone);
    const challenge = await this.otpService.verifyOtp({
      contact,
      purpose: dto.purpose,
      code: dto.code,
    });

    let user: UserRecord | null = null;

    if (challenge.userId) {
      user = await this.usersService.findById(challenge.userId);
    }

    if (!user) {
      user = contactType === 'EMAIL'
        ? await this.usersService.findByEmail(contact)
        : await this.usersService.findByPhone(contact);
    }

    if (!user) {
      if (dto.purpose === OtpPurpose.SIGN_UP) {
        user = await this.usersService.createExplicitUser({
          email: contactType === 'EMAIL' ? contact : undefined,
          phoneE164: contactType === 'PHONE' ? contact : undefined,
        });
      } else {
        throw new BadRequestException('No account exists for the provided contact.');
      }
    }

    await this.usersService.markLastLogin(user.id);

    this.logger.info(
      {
        userId: user.id.toString(),
        purpose: dto.purpose,
        contact,
      },
      'OTP verification succeeded',
    );

    const tokens = this.tokensService.generateTokens({ sub: user.id.toString() });

    return {
      user: this.usersService.toPublicUser(user),
      tokens,
    };
  }

  private resolveContact(email?: string, phone?: string): { contact: string; contactType: ContactType } {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = phone?.trim();

    if (!normalizedEmail && !normalizedPhone) {
      throw new BadRequestException('Either email or phone must be provided.');
    }

    if (normalizedEmail && normalizedPhone) {
      throw new BadRequestException('Provide either email or phone, not both.');
    }

    if (normalizedEmail) {
      return { contact: normalizedEmail, contactType: 'EMAIL' };
    }

    return { contact: normalizedPhone as string, contactType: 'PHONE' };
  }

}
