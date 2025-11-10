import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const toInt = ({ value }: { value: unknown }): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  return undefined;
};

export class SearchListingsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  yearMin?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  yearMax?: number;

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
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsString()
  locationState?: string;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  @Max(100)
  size?: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
