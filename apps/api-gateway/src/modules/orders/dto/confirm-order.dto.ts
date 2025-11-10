import { IsOptional, IsString } from 'class-validator';

export class ConfirmOrderDto {
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
