import { MediaAssetVisibility } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateUploadDto {
  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  filename?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  contentType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  byteSize?: number;

  @IsOptional()
  @IsEnum(MediaAssetVisibility)
  visibility?: MediaAssetVisibility;

  @IsOptional()
  @IsString()
  checksumSha256?: string;
}
