import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

type HealthResponse = ReturnType<HealthService['getLiveness']>;
type ReadinessResponse = ReturnType<HealthService['getReadiness']>;

@Controller({ path: 'healthz' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getStatus(): HealthResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  getReadiness(): ReadinessResponse {
    return this.healthService.getReadiness();
  }
}
