import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

type HealthResponse = ReturnType<HealthService['getStatus']>;

@Controller({ path: 'healthz' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getStatus(): HealthResponse {
    return this.healthService.getStatus();
  }
}
