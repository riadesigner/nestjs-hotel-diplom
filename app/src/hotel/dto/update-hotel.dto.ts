import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create-hotel.dto';

export class UpdateHotelParams extends PartialType(CreateHotelDto) {
  title: string;
  description: string;
}
