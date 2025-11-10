import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitListingDto {
  @IsOptional()
  @IsString()
  actorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
