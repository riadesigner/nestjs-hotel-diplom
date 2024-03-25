import { IsDefined } from 'class-validator';
import { ID } from '../dto/abstract-reservation';
import { ObjectId } from 'mongoose';
import { iHotel, iHotelRoom } from 'src/hotel/entities/hotel.entity';
import { iUser } from 'src/users/entities/user.entity';

export class iReservation {
  _id?: ObjectId;

  @IsDefined()
  userId: ID | iUser;

  @IsDefined()
  hotelId: ID | iHotel;

  @IsDefined()
  roomId: ID | iHotelRoom;

  @IsDefined()
  dateStart: Date;

  @IsDefined()
  dateEnd: Date;
}
