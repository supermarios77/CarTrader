import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto, ReviewSortBy, ReviewSortOrder } from './dto/get-reviews.dto';
import {
  ReviewResponseDto,
  ReviewListResponseDto,
  ReviewStatsDto,
} from './dto/review-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a review for a vehicle
   */
  async createReview(
    userId: string,
    vehicleId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Check if vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, userId: true, status: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Prevent users from reviewing their own vehicles
    if (vehicle.userId === userId) {
      throw new BadRequestException('You cannot review your own vehicle');
    }

    // Check if vehicle is active
    if (vehicle.status !== 'ACTIVE') {
      throw new BadRequestException('You can only review active vehicles');
    }

    // Check if user has already reviewed this vehicle
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        vehicleId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this vehicle');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        userId,
        vehicleId,
        rating: createReviewDto.rating,
        title: createReviewDto.title || null,
        comment: createReviewDto.comment || null,
        isVerified: false, // Can be set to true by admin later
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Review created: ${review.id} for vehicle ${vehicleId} by user ${userId}`);

    return this.mapToReviewResponse(review);
  }

  /**
   * Get reviews for a vehicle
   */
  async getVehicleReviews(
    vehicleId: string,
    query: GetReviewsDto,
  ): Promise<ReviewListResponseDto> {
    // Check if vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ReviewWhereInput = {
      vehicleId,
    };

    if (query.minRating) {
      where.rating = { gte: query.minRating };
    }

    // Build orderBy
    const orderBy: Prisma.ReviewOrderByWithRelationInput = {
      [query.sortBy || ReviewSortBy.CREATED_AT]:
        query.sortOrder || ReviewSortOrder.DESC,
    };

    // Get reviews and total count
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    // Get review statistics
    const stats = await this.getReviewStats(vehicleId);

    return {
      reviews: reviews.map((review) => this.mapToReviewResponse(review)),
      stats,
      total,
      page,
      limit,
    };
  }

  /**
   * Get review statistics for a vehicle
   */
  async getReviewStats(vehicleId: string): Promise<ReviewStatsDto> {
    const reviews = await this.prisma.review.findMany({
      where: { vehicleId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '5': 0,
          '4': 0,
          '3': 0,
          '2': 0,
          '1': 0,
        },
      };
    }

    const totalReviews = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.round((sum / totalReviews) * 10) / 10; // Round to 1 decimal

    const distribution = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
    };

    reviews.forEach((review) => {
      const rating = review.rating.toString() as keyof typeof distribution;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  /**
   * Get seller rating statistics
   */
  async getSellerRatingStats(sellerId: string): Promise<ReviewStatsDto> {
    // Get all vehicles by this seller
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId: sellerId },
      select: { id: true },
    });

    if (vehicles.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '5': 0,
          '4': 0,
          '3': 0,
          '2': 0,
          '1': 0,
        },
      };
    }

    const vehicleIds = vehicles.map((v) => v.id);

    const reviews = await this.prisma.review.findMany({
      where: {
        vehicleId: { in: vehicleIds },
      },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '5': 0,
          '4': 0,
          '3': 0,
          '2': 0,
          '1': 0,
        },
      };
    }

    const totalReviews = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.round((sum / totalReviews) * 10) / 10;

    const distribution = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
    };

    reviews.forEach((review) => {
      const rating = review.rating.toString() as keyof typeof distribution;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  /**
   * Update a review
   */
  async updateReview(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns the review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update review
    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(updateReviewDto.rating && { rating: updateReviewDto.rating }),
        ...(updateReviewDto.title !== undefined && { title: updateReviewDto.title || null }),
        ...(updateReviewDto.comment !== undefined && { comment: updateReviewDto.comment || null }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Review updated: ${reviewId} by user ${userId}`);

    return this.mapToReviewResponse(updatedReview);
  }

  /**
   * Delete a review
   */
  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns the review or is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (review.userId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    this.logger.log(`Review deleted: ${reviewId} by user ${userId}`);
  }

  /**
   * Get user's review for a vehicle (if exists)
   */
  async getUserReviewForVehicle(
    userId: string,
    vehicleId: string,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.prisma.review.findFirst({
      where: {
        userId,
        vehicleId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      return null;
    }

    return this.mapToReviewResponse(review);
  }

  /**
   * Map Prisma review to ReviewResponseDto
   */
  private mapToReviewResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      userId: review.userId,
      vehicleId: review.vehicleId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        email: review.user.email,
        avatar: review.user.avatar,
      },
    };
  }
}

