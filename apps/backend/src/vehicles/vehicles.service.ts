import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateVehicleDto, CreateVehicleFeatureDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehiclesDto } from './dto/filter-vehicles.dto';
import {
  VehicleResponseDto,
  VehicleListResponseDto,
  VehicleWithRelations,
} from './dto/vehicle-response.dto';
import { VehicleStatus, Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Create a new vehicle listing
   */
  async create(
    userId: string,
    createVehicleDto: CreateVehicleDto,
    images?: Express.Multer.File[],
  ): Promise<VehicleResponseDto> {
    // Validate category, make, and model exist and are active
    await this.validateVehicleReferences(
      createVehicleDto.categoryId,
      createVehicleDto.makeId,
      createVehicleDto.modelId,
    );

    // Upload images if provided
    let imageUrls: Array<{ url: string; key: string }> = [];
    if (images && images.length > 0) {
      imageUrls = await this.storageService.uploadImages(images, 'vehicles');
    }

    // Create vehicle with transaction
    const vehicle = await this.prisma.$transaction(async (tx) => {
      // Create vehicle
      const newVehicle = await tx.vehicle.create({
        data: {
          userId,
          categoryId: createVehicleDto.categoryId,
          makeId: createVehicleDto.makeId,
          modelId: createVehicleDto.modelId,
          title: createVehicleDto.title,
          description: createVehicleDto.description,
          price: createVehicleDto.price,
          currency: createVehicleDto.currency || 'PKR',
          year: createVehicleDto.year,
          mileage: createVehicleDto.mileage,
          mileageUnit: createVehicleDto.mileageUnit || 'km',
          transmission: createVehicleDto.transmission,
          fuelType: createVehicleDto.fuelType,
          bodyType: createVehicleDto.bodyType,
          engineCapacity: createVehicleDto.engineCapacity,
          color: createVehicleDto.color,
          registrationCity: createVehicleDto.registrationCity,
          registrationYear: createVehicleDto.registrationYear,
          city: createVehicleDto.city,
          province: createVehicleDto.province,
          address: createVehicleDto.address,
          latitude: createVehicleDto.latitude,
          longitude: createVehicleDto.longitude,
          status: VehicleStatus.DRAFT,
        },
      });

      // Create images
      if (imageUrls.length > 0) {
        await tx.vehicleImage.createMany({
          data: imageUrls.map((img, index) => ({
            vehicleId: newVehicle.id,
            url: img.url,
            order: index,
            isPrimary: index === 0,
          })),
        });
      }

      // Create features
      if (createVehicleDto.features && createVehicleDto.features.length > 0) {
        await tx.vehicleFeature.createMany({
          data: createVehicleDto.features.map((feature) => ({
            vehicleId: newVehicle.id,
            name: feature.name,
            value: feature.value,
          })),
        });
      }

      return newVehicle;
    });

    this.logger.log(`✅ Created vehicle: ${vehicle.id} by user: ${userId}`);

    return this.findOne(vehicle.id, userId);
  }

  /**
   * Find all vehicles with filters and pagination
   */
  async findAll(
    filterDto: FilterVehiclesDto,
    userId?: string,
  ): Promise<VehicleListResponseDto> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.VehicleWhereInput = {
      // Only show ACTIVE vehicles to public, unless user is owner/admin
      ...(userId
        ? {} // Authenticated users can see their own DRAFT vehicles
        : { status: VehicleStatus.ACTIVE }),
    };

    // Apply filters
    if (filterDto.categoryId) {
      where.categoryId = filterDto.categoryId;
    }
    if (filterDto.makeId) {
      where.makeId = filterDto.makeId;
    }
    if (filterDto.modelId) {
      where.modelId = filterDto.modelId;
    }
    if (filterDto.city) {
      where.city = { contains: filterDto.city, mode: 'insensitive' };
    }
    if (filterDto.province) {
      where.province = { contains: filterDto.province, mode: 'insensitive' };
    }
    if (filterDto.status) {
      where.status = filterDto.status;
    }
    if (filterDto.transmission) {
      where.transmission = filterDto.transmission;
    }
    if (filterDto.fuelType) {
      where.fuelType = filterDto.fuelType;
    }
    if (filterDto.bodyType) {
      where.bodyType = filterDto.bodyType;
    }
    if (filterDto.minPrice !== undefined || filterDto.maxPrice !== undefined) {
      where.price = {};
      if (filterDto.minPrice !== undefined) {
        where.price.gte = filterDto.minPrice;
      }
      if (filterDto.maxPrice !== undefined) {
        where.price.lte = filterDto.maxPrice;
      }
    }
    if (filterDto.minYear !== undefined || filterDto.maxYear !== undefined) {
      where.year = {};
      if (filterDto.minYear !== undefined) {
        where.year.gte = filterDto.minYear;
      }
      if (filterDto.maxYear !== undefined) {
        where.year.lte = filterDto.maxYear;
      }
    }
    if (filterDto.minMileage !== undefined || filterDto.maxMileage !== undefined) {
      where.mileage = {};
      if (filterDto.minMileage !== undefined) {
        where.mileage.gte = filterDto.minMileage;
      }
      if (filterDto.maxMileage !== undefined) {
        where.mileage.lte = filterDto.maxMileage;
      }
    }
    if (filterDto.search) {
      where.OR = [
        { title: { contains: filterDto.search, mode: 'insensitive' } },
        { description: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }
    if (filterDto.featured !== undefined) {
      where.featured = filterDto.featured;
    }
    if (filterDto.userId) {
      where.userId = filterDto.userId;
    }

    // If user is authenticated, show their DRAFT vehicles
    if (userId) {
      where.OR = [
        { ...where },
        { userId, status: VehicleStatus.DRAFT },
      ];
    }

    // Build orderBy
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'desc';
    const orderBy: Prisma.VehicleOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // If featured, prioritize featured vehicles
    if (filterDto.featured) {
      orderBy.featured = 'desc';
      orderBy.createdAt = 'desc';
    }

    // Execute query
    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
            take: 5, // Limit images in list view
          },
          features: {
            take: 5, // Limit features in list view
          },
          _count: {
            select: {
              favorites: true,
              messages: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    // Check if vehicles are favorited by user
    const vehiclesWithFavorites = userId
      ? await this.addFavoriteStatus(vehicles, userId)
      : vehicles;

    return {
      vehicles: vehiclesWithFavorites.map((v) => this.mapToResponseDto(v)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single vehicle by ID
   */
  async findOne(vehicleId: string, userId?: string): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
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
        },
        features: true,
        _count: {
          select: {
            favorites: true,
            messages: true,
            reviews: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if user can view this vehicle
    if (
      vehicle.status === VehicleStatus.DRAFT &&
      vehicle.userId !== userId
    ) {
      throw new NotFoundException('Vehicle not found');
    }

    // Increment view count (only for ACTIVE vehicles)
    if (vehicle.status === VehicleStatus.ACTIVE) {
      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { views: { increment: 1 } },
      });
      vehicle.views += 1;
    }

    // Check if favorited
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_vehicleId: {
            userId,
            vehicleId,
          },
        },
      });
      (vehicle as any).isFavorite = !!favorite;
    }

    return this.mapToResponseDto(vehicle);
  }

  /**
   * Update a vehicle
   */
  async update(
    vehicleId: string,
    userId: string,
    updateVehicleDto: UpdateVehicleDto,
    images?: Express.Multer.File[],
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check ownership
    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only update your own vehicles');
    }

    // Validate references if updating
    if (updateVehicleDto.categoryId || updateVehicleDto.makeId || updateVehicleDto.modelId) {
      await this.validateVehicleReferences(
        updateVehicleDto.categoryId || vehicle.categoryId,
        updateVehicleDto.makeId || vehicle.makeId,
        updateVehicleDto.modelId || vehicle.modelId,
      );
    }

    // Upload new images if provided
    let newImageUrls: Array<{ url: string; key: string }> = [];
    if (images && images.length > 0) {
      newImageUrls = await this.storageService.uploadImages(images, 'vehicles');
    }

    // Update vehicle with transaction
    const updatedVehicle = await this.prisma.$transaction(async (tx) => {
      // Update vehicle
      const updated = await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          ...(updateVehicleDto.title && { title: updateVehicleDto.title }),
          ...(updateVehicleDto.description !== undefined && {
            description: updateVehicleDto.description,
          }),
          ...(updateVehicleDto.price && { price: updateVehicleDto.price }),
          ...(updateVehicleDto.currency && { currency: updateVehicleDto.currency }),
          ...(updateVehicleDto.year && { year: updateVehicleDto.year }),
          ...(updateVehicleDto.mileage !== undefined && {
            mileage: updateVehicleDto.mileage,
          }),
          ...(updateVehicleDto.mileageUnit && {
            mileageUnit: updateVehicleDto.mileageUnit,
          }),
          ...(updateVehicleDto.transmission && {
            transmission: updateVehicleDto.transmission,
          }),
          ...(updateVehicleDto.fuelType && { fuelType: updateVehicleDto.fuelType }),
          ...(updateVehicleDto.bodyType && { bodyType: updateVehicleDto.bodyType }),
          ...(updateVehicleDto.engineCapacity !== undefined && {
            engineCapacity: updateVehicleDto.engineCapacity,
          }),
          ...(updateVehicleDto.color !== undefined && { color: updateVehicleDto.color }),
          ...(updateVehicleDto.registrationCity !== undefined && {
            registrationCity: updateVehicleDto.registrationCity,
          }),
          ...(updateVehicleDto.registrationYear !== undefined && {
            registrationYear: updateVehicleDto.registrationYear,
          }),
          ...(updateVehicleDto.city && { city: updateVehicleDto.city }),
          ...(updateVehicleDto.province !== undefined && {
            province: updateVehicleDto.province,
          }),
          ...(updateVehicleDto.address !== undefined && { address: updateVehicleDto.address }),
          ...(updateVehicleDto.latitude !== undefined && {
            latitude: updateVehicleDto.latitude,
          }),
          ...(updateVehicleDto.longitude !== undefined && {
            longitude: updateVehicleDto.longitude,
          }),
          ...(updateVehicleDto.status && { status: updateVehicleDto.status }),
          ...(updateVehicleDto.categoryId && { categoryId: updateVehicleDto.categoryId }),
          ...(updateVehicleDto.makeId && { makeId: updateVehicleDto.makeId }),
          ...('modelId' in updateVehicleDto && updateVehicleDto.modelId && { modelId: updateVehicleDto.modelId }),
        },
      });

      // Add new images
      if (newImageUrls.length > 0) {
        const existingImages = await tx.vehicleImage.findMany({
          where: { vehicleId },
          orderBy: { order: 'desc' },
          take: 1,
        });
        const maxOrder = existingImages[0]?.order ?? -1;

        await tx.vehicleImage.createMany({
          data: newImageUrls.map((img, index) => ({
            vehicleId,
            url: img.url,
            order: maxOrder + index + 1,
            isPrimary: false,
          })),
        });
      }

      // Update features if provided
      if (updateVehicleDto.features !== undefined) {
        // Delete existing features
        await tx.vehicleFeature.deleteMany({
          where: { vehicleId },
        });

        // Create new features
        if (updateVehicleDto.features.length > 0) {
          await tx.vehicleFeature.createMany({
            data: updateVehicleDto.features.map((feature) => ({
              vehicleId,
              name: feature.name,
              value: feature.value,
            })),
          });
        }
      }

      return updated;
    });

    this.logger.log(`✅ Updated vehicle: ${vehicleId} by user: ${userId}`);

    return this.findOne(vehicleId, userId);
  }

  /**
   * Delete a vehicle
   */
  async remove(vehicleId: string, userId: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        images: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check ownership
    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only delete your own vehicles');
    }

    // Delete images from storage
    const imageKeys = vehicle.images.map((img) => {
      // Extract key from URL
      const urlParts = img.url.split('/');
      return urlParts.slice(-2).join('/'); // vehicles/filename
    });

    if (imageKeys.length > 0) {
      await this.storageService.deleteImages(imageKeys);
    }

    // Delete vehicle (cascade will delete images and features)
    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    this.logger.log(`✅ Deleted vehicle: ${vehicleId} by user: ${userId}`);
  }

  /**
   * Mark vehicle as sold
   */
  async markAsSold(vehicleId: string, userId: string): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only mark your own vehicles as sold');
    }

    if (vehicle.status === VehicleStatus.SOLD) {
      throw new BadRequestException('Vehicle is already marked as sold');
    }

    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.SOLD,
        soldAt: new Date(),
      },
    });

    this.logger.log(`✅ Marked vehicle as sold: ${vehicleId}`);

    return this.findOne(vehicleId, userId);
  }

  /**
   * Publish a draft vehicle
   */
  async publish(vehicleId: string, userId: string): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        images: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only publish your own vehicles');
    }

    if (vehicle.status !== VehicleStatus.DRAFT) {
      throw new BadRequestException('Only draft vehicles can be published');
    }

    if (vehicle.images.length === 0) {
      throw new BadRequestException('Vehicle must have at least one image to be published');
    }

    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.ACTIVE,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    this.logger.log(`✅ Published vehicle: ${vehicleId}`);

    return this.findOne(vehicleId, userId);
  }

  /**
   * Validate category, make, and model exist and are active
   */
  private async validateVehicleReferences(
    categoryId: string,
    makeId: string,
    modelId: string,
  ): Promise<void> {
    const [category, make, model] = await Promise.all([
      this.prisma.category.findUnique({
        where: { id: categoryId },
      }),
      this.prisma.make.findUnique({
        where: { id: makeId },
      }),
      this.prisma.model.findUnique({
        where: { id: modelId },
      }),
    ]);

    if (!category || !category.isActive) {
      throw new BadRequestException('Invalid or inactive category');
    }

    if (!make || !make.isActive || make.categoryId !== categoryId) {
      throw new BadRequestException('Invalid or inactive make for this category');
    }

    if (!model || !model.isActive || model.makeId !== makeId) {
      throw new BadRequestException('Invalid or inactive model for this make');
    }
  }

  /**
   * Add favorite status to vehicles
   */
  private async addFavoriteStatus(
    vehicles: VehicleWithRelations[],
    userId: string,
  ): Promise<VehicleWithRelations[]> {
    const vehicleIds = vehicles.map((v) => v.id);
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        vehicleId: { in: vehicleIds },
      },
    });

    const favoriteSet = new Set(favorites.map((f) => f.vehicleId));

    return vehicles.map((vehicle) => ({
      ...vehicle,
      isFavorite: favoriteSet.has(vehicle.id),
    })) as VehicleWithRelations[];
  }

  /**
   * Map vehicle to response DTO
   */
  private mapToResponseDto(vehicle: VehicleWithRelations): VehicleResponseDto {
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
      features: vehicle.features,
      _count: vehicle._count,
      isFavorite: (vehicle as any).isFavorite || false,
    };
  }
}

