import { IsDefined, IsString } from 'class-validator';
import { ID } from './abstract-reservation';

export class CreateReservationDto {
  @IsDefined()
  @IsString()
  roomId: ID;

  @IsDefined()
  @IsString()
  dateStart: Date;

  @IsDefined()
  @IsString()
  dateEnd: Date;
}
