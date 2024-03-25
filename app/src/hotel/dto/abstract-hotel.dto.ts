import { ObjectId } from 'mongoose';
import { iHotel, iHotelRoom } from '../entities/hotel.entity';
import { UpdateHotelParams } from './update-hotel.dto';
import { CreateHotelDto } from './create-hotel.dto';

export type ID = string | ObjectId | iHotel;

export interface SearchHotelParams {
  limit?: number;
  offset?: number;
  title?: string;
}

export interface SearchRoomsParams {
  limit?: number;
  offset?: number;
  hotel?: ID | undefined;
  isEnabled?: boolean;
}

export interface NewRoomsParams {
  description?: string;
  hotelId: ID;
  images?: [string];
}

// ----------- API ----------

export interface iHotelResponse {
  id: ID;
  title: string;
  description: string;
}

export interface iHotelService {
  create(data: CreateHotelDto): Promise<iHotelResponse>;
  findById(id: ID): Promise<iHotel | null>;
  search(params: SearchHotelParams): Promise<iHotelResponse[]>;
  update(id: ID, data: UpdateHotelParams): Promise<iHotelResponse>;
}

export interface iHotelRoomService {
  create(data: Partial<iHotelRoom>): Promise<iHotelRoom | null>;
  findById(id: ID): Promise<iHotelRoom | null>;
  search(params: SearchRoomsParams): Promise<iHotelRoom[] | null>;
  update(id: ID, data: Partial<iHotelRoom>): Promise<iHotelRoom | null>;
}
