import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ModerateListingDto {
  @IsOptional()
  @IsString()
  moderatorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
