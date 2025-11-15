import { IsUUID, IsNotEmpty } from 'class-validator';

export class GetModelsDto {
  @IsNotEmpty({ message: 'makeId is required' })
  @IsUUID('4', { message: 'makeId must be a valid UUID' })
  makeId: string;
}

