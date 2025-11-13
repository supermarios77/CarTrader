import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { HttpMetricsInterceptor } from './http-metrics.interceptor';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      // PrometheusModule will handle default metrics collection
      // No need to manually call collectDefaultMetrics in the interceptor
    }),
  ],
  controllers: [MetricsController],
  providers: [
    HttpMetricsInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: HttpMetricsInterceptor,
    },
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}
