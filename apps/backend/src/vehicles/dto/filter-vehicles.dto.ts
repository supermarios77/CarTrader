import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VehicleCategory,
  VehicleStatus,
  TransmissionType,
  FuelType,
  BodyType,
} from '@prisma/client';

export class FilterVehiclesDto {
  // Pagination
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  // Filters
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  makeId?: string;

  @IsString()
  @IsOptional()
  modelId?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsEnum(TransmissionType)
  @IsOptional()
  transmission?: TransmissionType;

  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  @IsEnum(BodyType)
  @IsOptional()
  bodyType?: BodyType;

  // Price range
  @IsNumber()
  @Min(0, { message: 'Min price must be a positive number' })
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0, { message: 'Max price must be a positive number' })
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  // Year range
  @IsInt()
  @Min(1900, { message: 'Min year must be after 1900' })
  @Type(() => Number)
  @IsOptional()
  minYear?: number;

  @IsInt()
  @Min(1900, { message: 'Max year must be after 1900' })
  @Type(() => Number)
  @IsOptional()
  maxYear?: number;

  // Mileage range
  @IsInt()
  @Min(0, { message: 'Min mileage must be a positive number' })
  @Type(() => Number)
  @IsOptional()
  minMileage?: number;

  @IsInt()
  @Min(0, { message: 'Max mileage must be a positive number' })
  @Type(() => Number)
  @IsOptional()
  maxMileage?: number;

  // Search
  @IsString()
  @IsOptional()
  search?: string;

  // Featured
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  featured?: boolean;

  // User filter (for admin/moderator)
  @IsString()
  @IsOptional()
  userId?: string;

  // Sort
  @IsString()
  @IsOptional()
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'views';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

