import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get user dashboard statistics and data
   */
  async getDashboardData(userId: string) {
    // Get all statistics in parallel for performance
    const [
      totalVehicles,
      activeVehicles,
      draftVehicles,
      soldVehicles,
      totalFavorites,
      totalViews,
      recentVehicles,
    ] = await Promise.all([
      // Total vehicles count
      this.prisma.vehicle.count({
        where: { userId },
      }),

      // Active vehicles count
      this.prisma.vehicle.count({
        where: {
          userId,
          status: VehicleStatus.ACTIVE,
        },
      }),

      // Draft vehicles count
      this.prisma.vehicle.count({
        where: {
          userId,
          status: VehicleStatus.DRAFT,
        },
      }),

      // Sold vehicles count
      this.prisma.vehicle.count({
        where: {
          userId,
          status: VehicleStatus.SOLD,
        },
      }),

      // Total favorites count (vehicles favorited by others)
      this.prisma.favorite.count({
        where: {
          vehicle: {
            userId,
          },
        },
      }),

      // Total views across all user's vehicles
      this.prisma.vehicle.aggregate({
        where: { userId },
        _sum: {
          views: true,
        },
      }),

      // Recent vehicles (last 5)
      this.prisma.vehicle.findMany({
        where: { userId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          make: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          model: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              favorites: true,
              messages: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate additional stats
    const totalViewsCount = totalViews._sum.views || 0;
    const averageViews = totalVehicles > 0 ? Math.round(totalViewsCount / totalVehicles) : 0;

    // Transform recent vehicles to response format
    const recentVehiclesFormatted = recentVehicles.map((vehicle) => ({
      id: vehicle.id,
      title: vehicle.title,
      price: Number(vehicle.price),
      currency: vehicle.currency,
      status: vehicle.status,
      views: vehicle.views,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
      publishedAt: vehicle.publishedAt?.toISOString() || null,
      category: vehicle.category,
      make: vehicle.make,
      model: vehicle.model,
      images: vehicle.images,
      _count: vehicle._count,
    }));

    this.logger.log(`✅ Dashboard data fetched for user ${userId}`);

    return {
      stats: {
        totalVehicles,
        activeVehicles,
        draftVehicles,
        soldVehicles,
        totalFavorites,
        totalViews: totalViewsCount,
        averageViews,
      },
      recentVehicles: recentVehiclesFormatted,
    };
  }
}

