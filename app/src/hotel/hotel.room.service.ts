import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  iHotelRoomService,
  ID,
  SearchRoomsParams,
} from './dto/abstract-hotel.dto';
import { iHotelRoom } from './entities/hotel.entity';
import {
  Hotel,
  HotelDocument,
  HotelRoom,
  HotelRoomsDocument,
} from './hotel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomParams } from './dto/update-room.dto';

@Injectable()
export class HotelRoomService implements iHotelRoomService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>,
    @InjectModel(HotelRoom.name)
    private hotelRoomsModel: Model<HotelRoomsDocument>,
  ) {}

  search(params: SearchRoomsParams): Promise<iHotelRoom[]> {
    return new Promise(async (res) => {
      const opt = { isEnabled: params.isEnabled };
      if (params.hotel) {
        opt['hotel'] = params.hotel;
      }
      try {
        const rooms = await this.hotelRoomsModel
          .find(opt)
          .skip(params.offset)
          .limit(params.limit)
          .populate('hotel')
          .select('-__v')
          .lean()
          .exec();
        res(rooms);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }

  // добавить номер
  create(data: CreateRoomDto): Promise<iHotelRoom> {
    return new Promise(async (res) => {
      try {
        const newRoom = new this.hotelRoomsModel(data);
        await newRoom.save().then((t) => t.populate('hotel'));
        res(newRoom);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }

  // обновить информацию о номере
  update(id: ID, data: UpdateRoomParams): Promise<iHotelRoom> {
    return new Promise(async (res) => {
      try {
        const room = await this.hotelRoomsModel.findById(id);
        room.description = data.description ?? room.description;
        room.isEnabled =
          data.isEnabled !== undefined ? data.isEnabled : room.isEnabled;
        if (data.images && data.images.length) {
          room.images = [...room.images, ...data.images];
        }
        await room.save().then((t) => t.populate('hotel'));
        res(room);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }

  // найти номер по iD
  findById(id: ID): Promise<iHotelRoom> {
    return new Promise(async (res) => {
      try {
        const room = await this.hotelRoomsModel
          .findById(id)
          .populate('hotel')
          .select('-__v')
          .lean()
          .exec();
        res(room);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }
}
