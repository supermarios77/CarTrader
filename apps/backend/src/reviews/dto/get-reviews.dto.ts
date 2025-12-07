import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewSortBy {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
}

export enum ReviewSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetReviewsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy = ReviewSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(ReviewSortOrder)
  sortOrder?: ReviewSortOrder = ReviewSortOrder.DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;
}

