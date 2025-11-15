import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsInt,
  IsArray,
  ValidateNested,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VehicleCategory,
  TransmissionType,
  FuelType,
  BodyType,
} from '@prisma/client';

export class CreateVehicleFeatureDto {
  @IsString()
  @IsNotEmpty({ message: 'Feature name is required' })
  @MaxLength(100, { message: 'Feature name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Feature value must not exceed 200 characters' })
  value?: string;
}

export class CreateVehicleDto {
  // Required fields
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'Make ID is required' })
  makeId: string;

  @IsString()
  @IsNotEmpty({ message: 'Model ID is required' })
  modelId: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(3, { message: 'Currency code must be 3 characters' })
  currency?: string;

  @IsInt()
  @Min(1900, { message: 'Year must be after 1900' })
  @Max(new Date().getFullYear() + 1, {
    message: 'Year cannot be in the future',
  })
  year: number;

  @IsInt()
  @Min(0, { message: 'Mileage must be a positive number' })
  mileage: number;

  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Mileage unit must not exceed 10 characters' })
  mileageUnit?: string;

  @IsEnum(TransmissionType, {
    message: 'Invalid transmission type',
  })
  transmission: TransmissionType;

  @IsEnum(FuelType, {
    message: 'Invalid fuel type',
  })
  fuelType: FuelType;

  @IsEnum(BodyType, {
    message: 'Invalid body type',
  })
  bodyType: BodyType;

  // Optional fields
  @IsInt()
  @IsOptional()
  @Min(0, { message: 'Engine capacity must be a positive number' })
  engineCapacity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Color must not exceed 50 characters' })
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, {
    message: 'Registration city must not exceed 100 characters',
  })
  registrationCity?: string;

  @IsInt()
  @IsOptional()
  @Min(1900, { message: 'Registration year must be after 1900' })
  @Max(new Date().getFullYear(), {
    message: 'Registration year cannot be in the future',
  })
  registrationYear?: number;

  // Location
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Province must not exceed 100 characters' })
  province?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Features
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleFeatureDto)
  features?: CreateVehicleFeatureDto[];
}

