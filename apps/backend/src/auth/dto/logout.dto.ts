import { IsString, IsOptional, IsUUID } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsOptional()
  @IsUUID('4', { message: 'Session ID must be a valid UUID' })
  sessionId?: string;
}
