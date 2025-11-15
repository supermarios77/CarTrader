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
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehiclesDto } from './dto/filter-vehicles.dto';
import { MarkSoldDto } from './dto/mark-sold.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('vehicles')
@UseGuards(ThrottlerGuard) // Rate limiting
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * Create a new vehicle listing
   * POST /vehicles
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createVehicleDto: CreateVehicleDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    images?: Express.Multer.File[],
  ) {
    return this.vehiclesService.create(userId, createVehicleDto, images);
  }

  /**
   * Get all vehicles with filters and pagination
   * GET /vehicles
   */
  @Get()
  @Public()
  async findAll(
    @Query() filterDto: FilterVehiclesDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.vehiclesService.findAll(filterDto, userId);
  }

  /**
   * Get a single vehicle by ID
   * GET /vehicles/:id
   */
  @Get(':id')
  @Public()
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.vehiclesService.findOne(id, userId);
  }

  /**
   * Update a vehicle
   * PUT /vehicles/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: any, // Use any to handle FormData parsing
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    images?: Express.Multer.File[],
  ) {
    // Parse FormData fields that are JSON strings
    const updateVehicleDto: UpdateVehicleDto = { ...body };
    
    // Parse JSON fields from FormData
    if (body.features && typeof body.features === 'string') {
      try {
        updateVehicleDto.features = JSON.parse(body.features);
      } catch {
        updateVehicleDto.features = [];
      }
    }
    
    if (body.imageIdsToDelete && typeof body.imageIdsToDelete === 'string') {
      try {
        updateVehicleDto.imageIdsToDelete = JSON.parse(body.imageIdsToDelete);
      } catch {
        updateVehicleDto.imageIdsToDelete = [];
      }
    }
    
    // Convert numeric fields
    if (body.price) updateVehicleDto.price = Number(body.price);
    if (body.year) updateVehicleDto.year = Number(body.year);
    if (body.mileage !== undefined) updateVehicleDto.mileage = Number(body.mileage);
    if (body.engineCapacity !== undefined) updateVehicleDto.engineCapacity = Number(body.engineCapacity);
    if (body.registrationYear !== undefined) updateVehicleDto.registrationYear = Number(body.registrationYear);
    if (body.latitude !== undefined) updateVehicleDto.latitude = Number(body.latitude);
    if (body.longitude !== undefined) updateVehicleDto.longitude = Number(body.longitude);
    
    return this.vehiclesService.update(id, userId, updateVehicleDto, images);
  }

  /**
   * Delete a vehicle
   * DELETE /vehicles/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.vehiclesService.remove(id, userId);
  }

  /**
   * Mark vehicle as sold
   * POST /vehicles/:id/sold
   */
  @Post(':id/sold')
  @UseGuards(JwtAuthGuard)
  async markAsSold(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() markSoldDto: MarkSoldDto,
  ) {
    return this.vehiclesService.markAsSold(id, userId);
  }

  /**
   * Publish a draft vehicle
   * POST /vehicles/:id/publish
   */
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.vehiclesService.publish(id, userId);
  }
}

