import { IsDefined, IsOptional, IsString } from 'class-validator';

export class CreateHotelDto {
  @IsDefined()
  @IsString()
  title: string;

  @IsOptional()
  description?: string;
}
