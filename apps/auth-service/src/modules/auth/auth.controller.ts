import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GeneratedTokens } from '../tokens/tokens.service';
import { VerifyOtpResult } from './auth.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ expiresAt: string }> {
    return this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResult> {
    return this.authService.verifyOtp(dto);
  }

  @Post('tokens/refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto): Promise<GeneratedTokens> {
    return this.authService.refreshTokens(dto);
  }
}
