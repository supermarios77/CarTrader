import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  code: string;
}

