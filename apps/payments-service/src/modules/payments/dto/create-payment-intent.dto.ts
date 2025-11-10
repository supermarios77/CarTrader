import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @MaxLength(64)
  orderId!: string;

  @IsInt()
  @Min(0)
  amountCents!: number;

  @IsString()
  @MaxLength(3)
  currency!: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}
