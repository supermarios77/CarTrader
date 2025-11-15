import { IsOptional, IsEnum, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageStatus } from '@prisma/client';

export class GetMessagesDto {
  @IsOptional()
  @IsUUID('4', { message: 'Conversation partner ID must be a valid UUID' })
  conversationPartnerId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Vehicle ID must be a valid UUID' })
  vehicleId?: string;

  @IsOptional()
  @IsEnum(MessageStatus, { message: 'Invalid message status' })
  status?: MessageStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 20;
}

