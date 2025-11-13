import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Histogram, register } from 'prom-client';

// PrometheusModule.register({}) already calls collectDefaultMetrics, so we don't call it here
// Use the default register which PrometheusModule uses
const httpHistogram: Histogram<string> = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  registers: [register],
});

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{ method: string; route?: { path?: string }; url: string }>();
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();

    const method = request.method;
    const path = request.route?.path ?? request.url ?? 'unknown';

    const end = httpHistogram.startTimer({ method, path });

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode?.toString() ?? '200';
        end({ status_code: statusCode });
      }),
      catchError((error: unknown) => {
        const statusCode = (typeof error === 'object' && error && 'status' in error
          ? (error as { status?: number; statusCode?: number }).status ?? (error as { statusCode?: number }).statusCode
          : 500) ?? 500;
        end({ status_code: statusCode.toString() });
        return throwError(() => error);
      }),
    );
  }
}
