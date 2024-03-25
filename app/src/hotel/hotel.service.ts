import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelParams } from './dto/update-hotel.dto';
import {
  ID,
  iHotelResponse,
  iHotelService,
  SearchHotelParams,
} from './dto/abstract-hotel.dto';
import { iHotel } from './entities/hotel.entity';
import { Hotel, HotelDocument } from './hotel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class HotelService implements iHotelService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>,
  ) {}

  // добавить гостиницу
  async create(data: CreateHotelDto): Promise<iHotelResponse> {
    const newTitle = data.title.trim();

    try {
      await this.search({ title: newTitle });
    } catch (e) {
      throw new BadRequestException('гостиница с таким названием уже есть');
    }

    try {
      const opt = {
        title: newTitle,
        description: data.description ?? 'Без описания',
      };

      const newHotel = new this.hotelModel(opt);
      await newHotel.save();

      // BUILD RESPONSE
      const retHotel = {
        id: newHotel._id.toString(),
        title: newHotel.title,
        description: newHotel.description,
      };
      return retHotel;
    } catch (e) {
      console.log('log error', e);
      throw new BadRequestException('не удалось создать запись');
    }
  }

  // обновить информацию о гостинице
  async update(id: ID, data: UpdateHotelParams): Promise<iHotelResponse> {
    let hotel: HotelDocument;
    try {
      hotel = await this.hotelModel.findById(id);
    } catch (e) {
      throw new BadRequestException(`Гостиницы с Id ${id} не существует`);
    }
    try {
      hotel.title = data.title ?? hotel.title;
      hotel.description = data.description ?? hotel.description;
      await hotel.save();

      const retHotel: iHotelResponse = {
        id: hotel._id.toString(),
        title: hotel.title,
        description: hotel.description,
      };
      return retHotel;
    } catch (e) {
      console.log('log error', e);
      throw new BadRequestException(
        `не удалось обновить данные гостиницы с ID: ${id}`,
      );
    }
  }

  // найти гостиницу по ее iD
  findById(id: ID): Promise<iHotel> {
    return new Promise(async (res) => {
      try {
        const hotel = await this.hotelModel
          .findById(id)
          .select('-__v')
          .lean()
          .exec();
        res(hotel);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }

  // найти гостиницу по параметрам
  async search(params: SearchHotelParams): Promise<iHotelResponse[]> {
    const title = params.title ? params.title.toLowerCase() : '';
    const opt = title ? { title: { $regex: title, $options: 'i' } } : {};
    const limit = params.limit ?? 0;
    const offset = params.offset ?? 0;
    try {
      const arrHotels = await this.hotelModel
        .find(opt)
        .sort({ title: -1 })
        .skip(offset)
        .limit(limit)
        .select('-__v')
        .lean()
        .exec();

      // BUILD RESPONSE
      const retHotels: iHotelResponse[] = arrHotels.map((hotel) => {
        return {
          id: hotel._id,
          title: hotel.title,
          description: hotel.description,
        };
      });
      return retHotels;
    } catch (e) {
      console.log('log error', e);
      throw new BadRequestException(
        'не получается найти гостиницу по заданным параметрам',
      );
    }
  }
}
