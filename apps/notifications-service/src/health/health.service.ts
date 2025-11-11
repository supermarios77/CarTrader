import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { createChildLogger } from '@cartrader/logger';

import { NotificationsEnv } from '../config/environment';
import { DatabaseService } from '../modules/database/database.service';

interface HealthStatus {
  status: 'ok';
  timestamp: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class HealthService {
  private readonly logger = createChildLogger({ context: HealthService.name });

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService<NotificationsEnv>,
  ) {}

  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    await this.ensureDatabase();
    await this.ensureRedis();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: {
        database: 'up',
        redis: 'up',
      },
    };
  }

  private async ensureDatabase(): Promise<void> {
    try {
      const prisma = this.databaseService.client as unknown as {
        $queryRaw: (...args: unknown[]) => Promise<unknown>;
      };

      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error({ error }, 'Database readiness check failed');
      throw new ServiceUnavailableException('Database unavailable');
    }
  }

  private async ensureRedis(): Promise<void> {
    const redisUrl = this.configService.get('REDIS_URL', { infer: true });
    if (!redisUrl) {
      throw new ServiceUnavailableException('Redis URL not configured');
    }

    const client = new Redis(redisUrl, { lazyConnect: true });

    try {
      await client.connect();
      await client.ping();
    } catch (error) {
      this.logger.error({ error }, 'Redis readiness check failed');
      throw new ServiceUnavailableException('Redis unavailable');
    } finally {
      client.disconnect();
    }
  }
}
