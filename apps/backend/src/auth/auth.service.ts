import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
import { getRequiredEnv } from './utils/env.utils';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        emailVerified: false,
        role: 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    // Generate and send verification email
    await this.sendVerificationEmail(user.id, user.email, user.firstName);

    // Create session and generate tokens
    return this.createSessionAndTokens(user.id, user.email, user.role);
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session and generate tokens
    return this.createSessionAndTokens(user.id, user.email, user.role);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify session exists
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      if (session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired');
      }

      if (session.user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
      }

      // Generate new access token with retry logic for unique constraint
      let accessTokenPayload: JwtPayload = {
        sub: session.userId,
        email: session.user.email,
        role: session.user.role,
        type: 'access',
      };

      let accessToken: string;
      let retries = 3;
      
      while (retries > 0) {
        accessToken = this.jwtService.sign(accessTokenPayload, {
          secret: getRequiredEnv('JWT_SECRET'),
          expiresIn: '15m',
        });

        // Update session with new access token
        try {
          await this.prisma.session.update({
            where: { id: payload.sessionId },
            data: { token: accessToken },
          });
          break; // Success, exit retry loop
        } catch (updateError: any) {
          // If update fails due to unique constraint on token, generate new token and retry
          if (updateError.code === 'P2002' && updateError.meta?.target?.includes('token')) {
            retries--;
            if (retries === 0) {
              throw new ConflictException('Failed to refresh token. Please try again.');
            }
            // Add timestamp variation to ensure different token
            accessTokenPayload = {
              ...accessTokenPayload,
              iat: Math.floor(Date.now() / 1000),
            };
          } else {
            throw updateError; // Re-throw if it's a different error
          }
        }
      }

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(userId: string, sessionId: string): Promise<{ message: string }> {
    // Verify session belongs to user
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string): Promise<{ message: string }> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Session revoked successfully' };
  }

  /**
   * Helper: Create session and generate tokens
   */
  private async createSessionAndTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthResponseDto> {
    // Generate tokens
    const accessTokenPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    const sessionId = randomUUID();

    const refreshTokenPayload: JwtRefreshPayload = {
      sub: userId,
      sessionId,
      type: 'refresh',
    };

    let accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: getRequiredEnv('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Create session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Handle potential unique constraint violation on token field
    // Retry with a new token if collision occurs (extremely rare)
    let retries = 3;
    while (retries > 0) {
      try {
        await this.prisma.session.create({
          data: {
            id: sessionId,
            userId,
            token: accessToken,
            refreshToken,
            expiresAt,
          },
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        // If unique constraint violation on token, generate new access token and retry
        if (error.code === 'P2002' && error.meta?.target?.includes('token')) {
          retries--;
          if (retries === 0) {
            throw new ConflictException('Failed to create session. Please try again.');
          }
          // Generate a new access token with a unique jti (JWT ID) to ensure uniqueness
          accessToken = this.jwtService.sign(
            { 
              ...accessTokenPayload, 
              jti: randomUUID(), // Add unique JWT ID
              iat: Math.floor(Date.now() / 1000),
            },
            {
              secret: getRequiredEnv('JWT_SECRET'),
              expiresIn: '15m',
            },
          );
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    }

    // Get user for response
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: user!,
    };
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    // Find verification token
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestException('Verification token has expired. Please request a new one.');
    }

    // Check if email is already verified
    if (verificationToken.user.emailVerified) {
      // Delete token since it's already used
      await this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestException('Email is already verified');
    }

    // Verify email and delete token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If an account exists with this email, a verification email has been sent.' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Send verification email
    await this.sendVerificationEmail(user.id, user.email, user.firstName);

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Helper: Generate and send verification email
   */
  private async sendVerificationEmail(
    userId: string,
    email: string,
    firstName: string | null,
  ): Promise<void> {
    // Generate verification token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Delete any existing verification token for this user
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Create new verification token
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      firstName || null,
      token,
    );
  }
}

