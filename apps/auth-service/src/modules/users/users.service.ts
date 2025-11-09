import { BadRequestException, Injectable } from '@nestjs/common';

import { createChildLogger } from '@cartrader/logger';

import { UsersRepository, UserRecord, CreateUserInput } from './users.repository';

export type { UserRecord } from './users.repository';

export interface PublicUser {
  id: string;
  email: string | null;
  phoneE164: string | null;
  displayName: string | null;
  status: string;
  lastLoginAt: string | null;
}

@Injectable()
export class UsersService {
  private readonly logger = createChildLogger({ context: UsersService.name });

  constructor(private readonly repository: UsersRepository) {}

  async findById(id: bigint): Promise<UserRecord | null> {
    return this.repository.findById(id);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.repository.findByEmail(email.toLowerCase());
  }

  async findByPhone(phoneE164: string): Promise<UserRecord | null> {
    return this.repository.findByPhone(phoneE164);
  }

  async ensureUserExistsForSignUp(payload: CreateUserInput): Promise<UserRecord> {
    const email = payload.email?.toLowerCase();
    if (!email && !payload.phoneE164) {
      throw new BadRequestException('A contact identifier is required to create a user.');
    }

    const existing = email
      ? await this.findByEmail(email)
      : payload.phoneE164
      ? await this.findByPhone(payload.phoneE164)
      : null;

    if (existing) {
      return existing;
    }

    this.logger.debug({ email, phone: payload.phoneE164 }, 'Creating new user record');
    return this.repository.createUser({
      email: email ?? null,
      phoneE164: payload.phoneE164 ?? null,
      displayName: payload.displayName ?? (email ?? payload.phoneE164 ?? null),
    });
  }

  async createExplicitUser(payload: CreateUserInput): Promise<UserRecord> {
    return this.repository.createUser({
      email: payload.email?.toLowerCase() ?? null,
      phoneE164: payload.phoneE164 ?? null,
      displayName: payload.displayName ?? payload.email ?? payload.phoneE164 ?? null,
    });
  }

  async markLastLogin(userId: bigint): Promise<void> {
    await this.repository.updateLastLogin(userId);
  }

  toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id.toString(),
      email: user.email,
      phoneE164: user.phoneE164,
      displayName: user.displayName,
      status: user.status,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    };
  }
}
