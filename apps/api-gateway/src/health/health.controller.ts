import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

type HealthResponse = ReturnType<HealthService['getLiveness']>;
type ReadinessResponse = Awaited<ReturnType<HealthService['getReadiness']>>;

@Controller({ path: 'healthz' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getStatus(): HealthResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  getReadiness(): Promise<ReadinessResponse> {
    return this.healthService.getReadiness();
  }
}
