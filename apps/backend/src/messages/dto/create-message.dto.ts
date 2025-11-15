import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID('4', { message: 'Receiver ID must be a valid UUID' })
  receiverId: string;

  @IsUUID('4', { message: 'Vehicle ID must be a valid UUID' })
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject?: string;

  @IsString()
  @MinLength(1, { message: 'Message content is required' })
  @MaxLength(5000, { message: 'Message content must not exceed 5000 characters' })
  content: string;
}

