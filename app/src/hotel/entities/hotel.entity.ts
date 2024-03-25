import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ID } from '../dto/abstract-hotel.dto';

export class iHotel {
  _id?: ObjectId;

  @IsDefined()
  @IsString()
  //@IsUniq()
  title: string;

  @IsOptional()
  description?: string;

  @IsDefined()
  createdAt: Date;

  @IsDefined()
  updatedAt: Date;
}

export class iHotelRoom {
  _id?: ObjectId;

  @IsDefined()
  hotel: ID;

  @IsOptional()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsDefined()
  createdAt: Date;

  @IsDefined()
  updatedAt: Date;

  @IsDefined()
  isEnabled: boolean;
}
