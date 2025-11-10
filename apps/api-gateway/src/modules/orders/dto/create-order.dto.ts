import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  listingId!: string;

  @IsOptional()
  @IsString()
  buyerId?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}
