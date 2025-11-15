import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('dashboard')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get user dashboard data
   * GET /dashboard
   */
  @Get()
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getDashboardData(userId);
  }
}

