import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { loadApiGatewayConfig } from '../config/environment';

interface HealthStatus {
  status: 'ok';
  timestamp: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class HealthService {
  private readonly logger = createChildLogger({ context: HealthService.name });
  private readonly dependencies: Array<[string, string]>;

  constructor(private readonly httpService: HttpService) {
    const config = loadApiGatewayConfig();
    this.dependencies = [
      ['listingsService', config.LISTINGS_SERVICE_BASE_URL],
      ['mediaService', config.MEDIA_SERVICE_BASE_URL],
      ['notificationsService', config.NOTIFICATIONS_SERVICE_BASE_URL],
      ['ordersService', config.ORDERS_SERVICE_BASE_URL],
      ['searchService', config.SEARCH_SERVICE_BASE_URL],
    ];
  }

  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    const details: Record<string, string> = {};

    await Promise.all(
      this.dependencies.map(async ([name, baseUrl]) => {
        await this.ensureServiceHealthy(name, baseUrl);
        details[name] = 'up';
      }),
    );

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details,
    };
  }

  private async ensureServiceHealthy(name: string, baseUrl: string): Promise<void> {
    try {
      const readinessUrl = this.buildReadinessUrl(baseUrl);
      const response = await firstValueFrom(this.httpService.get(readinessUrl, { timeout: 1500 }));
      if (response.status < 200 || response.status >= 300) {
        throw new ServiceUnavailableException(`${name} responded with status ${response.status}`);
      }
    } catch (error) {
      this.logger.error({ dependency: name, error }, 'Dependency readiness check failed');

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (this.isAxiosError(error)) {
        throw new ServiceUnavailableException(`${name} unavailable`);
      }

      throw new ServiceUnavailableException(`${name} check failed`);
    }
  }

  private buildReadinessUrl(baseUrl: string): string {
    const url = new URL(baseUrl);
    url.pathname = '/healthz/ready';
    url.search = '';
    url.hash = '';
    return url.toString();
  }

  private isAxiosError(error: unknown): error is { isAxiosError?: boolean } {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
  }
}
