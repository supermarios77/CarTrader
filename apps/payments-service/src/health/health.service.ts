import { Injectable } from '@nestjs/common';

import { createChildLogger } from '@cartrader/logger';

interface HealthStatus {
  status: 'ok';
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly logger = createChildLogger({ context: HealthService.name });

  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness(): HealthStatus {
    this.logger.debug('Readiness check succeeded');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
