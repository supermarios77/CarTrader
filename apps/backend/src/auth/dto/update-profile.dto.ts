import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((o) => o.firstName !== null && o.firstName !== undefined && o.firstName !== '')
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.lastName !== null && o.lastName !== undefined && o.lastName !== '')
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.phone !== null && o.phone !== undefined && o.phone !== '')
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.bio !== null && o.bio !== undefined && o.bio !== '')
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.location !== null && o.location !== undefined && o.location !== '')
  @IsString()
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.city !== null && o.city !== undefined && o.city !== '')
  @IsString()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.country !== null && o.country !== undefined && o.country !== '')
  @IsString()
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.avatar !== null && o.avatar !== undefined && o.avatar !== '')
  @IsString()
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatar?: string | null;
}

