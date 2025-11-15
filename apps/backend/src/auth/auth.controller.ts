import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { SendPhoneVerificationDto } from './dto/send-phone-verification.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
@UseGuards(ThrottlerGuard) // Rate limiting on all auth endpoints
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    // DTO validation happens via ValidationPipe (runs before method execution)
    // Service validates token structure, content, and session
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser('id') userId: string, @Body() logoutDto: LogoutDto) {
    return this.authService.logout(userId, logoutDto.sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser('id') userId: string) {
    return this.authService.getUserSessions(userId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.revokeSession(userId, sessionId);
  }

  @Public()
  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmailGet(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendVerificationDto.email);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @Post('send-phone-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async sendPhoneVerification(
    @CurrentUser('id') userId: string,
    @Body() sendPhoneVerificationDto: SendPhoneVerificationDto,
  ) {
    return this.authService.sendPhoneVerificationCode(userId, sendPhoneVerificationDto.phone);
  }

  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async verifyPhone(
    @CurrentUser('id') userId: string,
    @Body() verifyPhoneDto: VerifyPhoneDto,
  ) {
    return this.authService.verifyPhone(verifyPhoneDto.token, verifyPhoneDto.code);
  }

  @Post('resend-phone-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async resendPhoneVerification(@CurrentUser('id') userId: string) {
    return this.authService.resendPhoneVerificationCode(userId);
  }
}

