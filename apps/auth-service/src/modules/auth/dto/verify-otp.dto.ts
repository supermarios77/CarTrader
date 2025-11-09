import { IsEmail, IsEnum, IsOptional, IsString, Matches, Length } from 'class-validator';

import { OtpPurpose } from '../../otp/otp.service';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export class VerifyOtpDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(E164_REGEX, { message: 'phone must be a valid E.164 number (e.g. +1234567890)' })
  phone?: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;

  @IsString()
  @Length(4, 10)
  code!: string;
}
