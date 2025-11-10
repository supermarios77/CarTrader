import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RefundOrderDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  amountCents?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
