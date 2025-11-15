import { IsUUID, IsNotEmpty } from 'class-validator';

export class GetMakesDto {
  @IsNotEmpty({ message: 'categoryId is required' })
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId: string;
}

