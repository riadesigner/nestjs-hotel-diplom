import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { iReservation } from './entities/reservation.entity';
import { ID } from './dto/abstract-reservation';
import { Hotel, HotelRoom } from 'src/hotel/hotel.schema';
import { User } from 'src/users/users.schema';

export type ReservationDocument = iReservation & Document;

@Schema()
export class Reservation implements iReservation {
  @Prop({ type: String, ref: User.name })
  userId: ID;
  @Prop({ type: String, ref: Hotel.name })
  hotelId: ID;
  @Prop({ type: String, ref: HotelRoom.name })
  roomId: ID;
  @Prop()
  dateStart: Date;
  @Prop()
  dateEnd: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);