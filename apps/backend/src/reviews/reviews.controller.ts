import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('reviews')
@UseGuards(ThrottlerGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a review for a vehicle
   * POST /reviews/vehicles/:vehicleId
   */
  @Post('vehicles/:vehicleId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, vehicleId, createReviewDto);
  }

  /**
   * Get reviews for a vehicle
   * GET /reviews/vehicles/:vehicleId
   */
  @Get('vehicles/:vehicleId')
  @Public()
  async getVehicleReviews(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Query() query: GetReviewsDto,
  ) {
    return this.reviewsService.getVehicleReviews(vehicleId, query);
  }

  /**
   * Get review statistics for a vehicle
   * GET /reviews/vehicles/:vehicleId/stats
   */
  @Get('vehicles/:vehicleId/stats')
  @Public()
  async getVehicleReviewStats(@Param('vehicleId', ParseUUIDPipe) vehicleId: string) {
    return this.reviewsService.getReviewStats(vehicleId);
  }

  /**
   * Get seller rating statistics
   * GET /reviews/sellers/:sellerId/stats
   */
  @Get('sellers/:sellerId/stats')
  @Public()
  async getSellerRatingStats(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.reviewsService.getSellerRatingStats(sellerId);
  }

  /**
   * Get user's review for a vehicle (if exists)
   * GET /reviews/vehicles/:vehicleId/my-review
   */
  @Get('vehicles/:vehicleId/my-review')
  @UseGuards(JwtAuthGuard)
  async getUserReviewForVehicle(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    const review = await this.reviewsService.getUserReviewForVehicle(userId, vehicleId);
    return review || { message: 'No review found' };
  }

  /**
   * Update a review
   * PUT /reviews/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param('id', ParseUUIDPipe) reviewId: string,
    @CurrentUser('id') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(userId, reviewId, updateReviewDto);
  }

  /**
   * Delete a review
   * DELETE /reviews/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('id', ParseUUIDPipe) reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.reviewsService.deleteReview(userId, reviewId);
  }
}

