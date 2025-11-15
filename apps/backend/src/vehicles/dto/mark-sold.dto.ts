import { IsString, IsOptional } from 'class-validator';

export class MarkSoldDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

