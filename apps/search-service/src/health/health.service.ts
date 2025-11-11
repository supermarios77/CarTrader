import { Client } from '@opensearch-project/opensearch';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createChildLogger } from '@cartrader/logger';

import { SearchServiceEnv } from '../config/environment';

interface HealthStatus {
  status: 'ok';
  timestamp: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class HealthService {
  private readonly logger = createChildLogger({ context: HealthService.name });

  constructor(private readonly configService: ConfigService<SearchServiceEnv>) {}

  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    await this.ensureOpenSearch();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: {
        opensearch: 'up',
      },
    };
  }

  private async ensureOpenSearch(): Promise<void> {
    const node = this.configService.get('OPENSEARCH_NODE', { infer: true });
    const username = this.configService.get('OPENSEARCH_USERNAME', { infer: true });
    const password = this.configService.get('OPENSEARCH_PASSWORD', { infer: true });

    if (!node || !username || !password) {
      throw new ServiceUnavailableException('OpenSearch configuration incomplete');
    }

    const client = new Client({
      node,
      auth: {
        username,
        password,
      },
    });

    try {
      const response = await client.ping();
      if (!response.body) {
        throw new Error('Ping response not OK');
      }
    } catch (error) {
      this.logger.error({ error }, 'OpenSearch readiness check failed');
      throw new ServiceUnavailableException('OpenSearch unavailable');
    } finally {
      await client.close();
    }
  }
}
