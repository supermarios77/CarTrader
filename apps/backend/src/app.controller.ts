import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  async getHealth() {
    const dbHealthy = await this.prisma.isHealthy();

    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'cartrader-backend',
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }
}
