import { IsArray, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class IndexListingDto {
  @IsString()
  id!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  priceCents!: number;

  @IsString()
  currencyCode!: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  mileageKm?: number;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsString()
  locationState?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sellerId?: string;
}
