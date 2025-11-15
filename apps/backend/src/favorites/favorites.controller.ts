import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetFavoritesDto } from './dto/get-favorites.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('favorites')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * Add a vehicle to favorites
   * POST /favorites/vehicles/:id
   */
  @Post('vehicles/:id')
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.favoritesService.addFavorite(userId, vehicleId);
    return { message: 'Vehicle added to favorites' };
  }

  /**
   * Remove a vehicle from favorites
   * DELETE /favorites/vehicles/:id
   */
  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.favoritesService.removeFavorite(userId, vehicleId);
  }

  /**
   * Get user's favorite vehicles
   * GET /favorites
   */
  @Get()
  async getUserFavorites(
    @CurrentUser('id') userId: string,
    @Query() query: GetFavoritesDto,
  ) {
    return this.favoritesService.getUserFavorites(
      userId,
      query.page,
      query.limit,
    );
  }

  /**
   * Check if a vehicle is favorited
   * GET /favorites/vehicles/:id/check
   */
  @Get('vehicles/:id/check')
  async checkFavorite(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(
      userId,
      vehicleId,
    );
    return { isFavorite };
  }
}

