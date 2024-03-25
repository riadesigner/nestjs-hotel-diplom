import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { iHotel, iHotelRoom } from './entities/hotel.entity';
import { ID } from './dto/abstract-hotel.dto';

export type HotelDocument = iHotel & Document;
export type HotelRoomsDocument = iHotelRoom & Document;

@Schema()
export class Hotel implements iHotel {
  @Prop({ required: true, unique: true })
  title: string;
  @Prop()
  description?: string;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);

@Schema()
export class HotelRoom implements iHotelRoom {
  @Prop({ type: String, ref: Hotel.name })
  hotel: ID;
  @Prop()
  description?: string;
  @Prop()
  images: string[];
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop()
  isEnabled: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);
