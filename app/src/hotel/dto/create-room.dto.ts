import { IsDefined, IsOptional } from 'class-validator';
import { ID } from './abstract-hotel.dto';

export class CreateRoomDto {
  @IsDefined()
  hotel: ID;

  @IsOptional()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsDefined()
  isEnabled: boolean;
}
