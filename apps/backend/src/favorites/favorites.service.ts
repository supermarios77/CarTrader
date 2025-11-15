import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Add a vehicle to user's favorites
   */
  async addFavorite(userId: string, vehicleId: string): Promise<void> {
    // Check if vehicle exists and is active
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== VehicleStatus.ACTIVE) {
      throw new BadRequestException('Only active vehicles can be favorited');
    }

    // Check if already favorited
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId,
        },
      },
    });

    if (existingFavorite) {
      throw new BadRequestException('Vehicle is already in favorites');
    }

    // Add to favorites
    await this.prisma.favorite.create({
      data: {
        userId,
        vehicleId,
      },
    });

    this.logger.log(`✅ Added vehicle ${vehicleId} to favorites for user ${userId}`);
  }

  /**
   * Remove a vehicle from user's favorites
   */
  async removeFavorite(userId: string, vehicleId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    this.logger.log(`✅ Removed vehicle ${vehicleId} from favorites for user ${userId}`);
  }

  /**
   * Get user's favorite vehicles with pagination
   */
  async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    // Get favorites with vehicle data
    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          vehicle: {
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
                  logo: true,
                },
              },
              model: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  city: true,
                },
              },
              images: {
                orderBy: { order: 'asc' },
                take: 1, // Only first image for listing
              },
              _count: {
                select: {
                  favorites: true,
                  messages: true,
                  reviews: true,
                },
              },
            },
            where: {
              status: VehicleStatus.ACTIVE, // Only show active vehicles
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({
        where: { userId },
      }),
    ]);

    // Filter out favorites where vehicle was deleted or is inactive
    const validFavorites = favorites.filter((f) => f.vehicle !== null);

    // Transform to vehicle response format
    const vehicles = validFavorites.map((favorite) => {
      const vehicle = favorite.vehicle!;
      return {
        id: vehicle.id,
        userId: vehicle.userId,
        categoryId: vehicle.categoryId,
        makeId: vehicle.makeId,
        modelId: vehicle.modelId,
        title: vehicle.title,
        description: vehicle.description,
        price: Number(vehicle.price),
        currency: vehicle.currency,
        year: vehicle.year,
        mileage: vehicle.mileage,
        mileageUnit: vehicle.mileageUnit,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        bodyType: vehicle.bodyType,
        engineCapacity: vehicle.engineCapacity,
        color: vehicle.color,
        registrationCity: vehicle.registrationCity,
        registrationYear: vehicle.registrationYear,
        city: vehicle.city,
        province: vehicle.province,
        address: vehicle.address,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        status: vehicle.status,
        featured: vehicle.featured,
        views: vehicle.views,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        publishedAt: vehicle.publishedAt,
        soldAt: vehicle.soldAt,
        expiresAt: vehicle.expiresAt,
        category: vehicle.category,
        make: vehicle.make,
        model: vehicle.model,
        user: vehicle.user,
        images: vehicle.images,
        features: [], // Not included in favorites list for performance
        _count: vehicle._count,
        isFavorite: true, // Always true since we're in favorites
        favoritedAt: favorite.createdAt, // When it was favorited
      };
    });

    return {
      vehicles,
      pagination: {
        page,
        limit,
        total: validFavorites.length, // Only count valid favorites
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if a vehicle is favorited by user
   */
  async isFavorite(userId: string, vehicleId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId,
        },
      },
    });

    return !!favorite;
  }
}

