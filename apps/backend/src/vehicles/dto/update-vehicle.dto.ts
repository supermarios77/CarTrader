import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto, CreateVehicleFeatureDto } from './create-vehicle.dto';
import { IsEnum, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleStatus } from '@prisma/client';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsEnum(VehicleStatus, {
    message: 'Invalid vehicle status',
  })
  @IsOptional()
  status?: VehicleStatus;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleFeatureDto)
  features?: CreateVehicleFeatureDto[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true, message: 'Each image ID must be a valid UUID' })
  imageIdsToDelete?: string[];
}

