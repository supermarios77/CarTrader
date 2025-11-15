import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendPhoneVerificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number (e.g., +1234567890)',
  })
  phone: string;
}

