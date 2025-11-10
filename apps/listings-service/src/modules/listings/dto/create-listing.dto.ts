import {
  BodyType,
  FuelType,
  ListingType,
  MediaType,
  TransmissionType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class ListingMediaInputDto {
  @IsEnum(MediaType)
  type: MediaType = MediaType.IMAGE;

  @IsString()
  @MaxLength(2048)
  url!: string;

  @IsString()
  @MaxLength(512)
  storageKey!: string;

  @IsInt()
  @Min(0)
  sortOrder: number = 0;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateListingDto {
  @IsString()
  sellerId!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;

  @IsEnum(ListingType)
  type!: ListingType;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  make?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  variant?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileageKm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  engineCapacity?: number;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  exteriorColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  interiorColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  vin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  registrationCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ownership?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationState?: string;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  locationLatitude?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  locationLongitude?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ListingMediaInputDto)
  @IsArray()
  @ArrayMaxSize(40)
  media?: ListingMediaInputDto[];
}

export { ListingMediaInputDto };
