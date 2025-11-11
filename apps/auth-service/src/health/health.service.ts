import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { createChildLogger } from '@cartrader/logger';

import { DatabaseService } from '../modules/database/database.service';

type HealthStatus = {
  status: 'ok';
  timestamp: string;
  details?: Record<string, unknown>;
};

@Injectable()
export class HealthService {
  private readonly logger = createChildLogger({ context: HealthService.name });

  constructor(private readonly databaseService: DatabaseService) {}

  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    await this.ensureDatabase();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: {
        database: 'up',
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
}
