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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
        emailVerified: false, // Email verification can be added later
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
        secret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production-refresh',
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

      // Generate new access token
      const accessTokenPayload: JwtPayload = {
        sub: session.userId,
        email: session.user.email,
        role: session.user.role,
        type: 'access',
      };

      // Generate new access token with retry logic for unique constraint
      let accessToken: string;
      let retries = 3;
      
      while (retries > 0) {
        accessToken = this.jwtService.sign(accessTokenPayload, {
          secret: process.env.JWT_SECRET || 'change-me-in-production',
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

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production-refresh',
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
          // Generate a new access token with a slight variation (add timestamp to payload)
          accessToken = this.jwtService.sign(
            { ...accessTokenPayload, iat: Math.floor(Date.now() / 1000) },
            {
              secret: process.env.JWT_SECRET || 'change-me-in-production',
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
}

