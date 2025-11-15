import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  @IsOptional()
  bio?: string;

  @IsString()
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  @IsOptional()
  location?: string;

  @IsString()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatar?: string;
}

