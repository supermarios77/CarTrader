import { Body, Controller, Post } from '@nestjs/common';

import { AuthService, VerifyOtpResult } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller({ path: 'auth/otp', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request')
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ expiresAt: string }> {
    return this.authService.requestOtp(dto);
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResult> {
    return this.authService.verifyOtp(dto);
  }
}
