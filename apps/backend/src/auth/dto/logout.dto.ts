import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsUUID('4', { message: 'Session ID must be a valid UUID' })
  sessionId: string;
}

