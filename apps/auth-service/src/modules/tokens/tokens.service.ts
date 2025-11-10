import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

type ExpiresIn = SignOptions['expiresIn'];

@Injectable()
export class TokensService {
  private readonly accessJwt: JwtService;
  private readonly refreshJwt: JwtService;

  constructor(private readonly configService: ConfigService) {
    this.accessJwt = new JwtService({
      secret: this.getRequired('AUTH_JWT_SECRET'),
    });

    this.refreshJwt = new JwtService({
      secret: this.getRequired('AUTH_REFRESH_SECRET'),
    });
  }

  generateTokens(payload: Record<string, unknown>): GeneratedTokens {
    return {
      accessToken: this.accessJwt.sign(payload, {
        expiresIn: this.getDuration('AUTH_JWT_EXPIRES_IN'),
      }),
      refreshToken: this.refreshJwt.sign(payload, {
        expiresIn: this.getDuration('AUTH_REFRESH_EXPIRES_IN'),
      }),
    };
  }

  verifyAccessToken<T extends object = Record<string, unknown>>(token: string): T {
    return this.accessJwt.verify<T>(token);
  }

  verifyRefreshToken<T extends object = Record<string, unknown>>(token: string): T {
    return this.refreshJwt.verify<T>(token);
  }

  private getDuration(key: string): ExpiresIn {
    const raw = this.getRequired(key);
    if (/^\d+$/.test(raw)) {
      return Number(raw);
    }
    return raw as ExpiresIn;
  }

  private getRequired(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required configuration value: ${key}`);
    }
    return value;
  }
}
