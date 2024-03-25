import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Session,
  Res,
  Put,
  HttpStatus,
  HttpException,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelRoomService } from './hotel.room.service';
import { NewRoomsParams, SearchRoomsParams } from './dto/abstract-hotel.dto';
import { iHotel, iHotelRoom } from './entities/hotel.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomParams } from './dto/update-room.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../utils/file-upload.utils';

@Controller()
export class HotelRoomsController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly roomService: HotelRoomService,
  ) {}

  /**
   *
   *  ADMINS
   *
   */

  // администраторы: Добавить номер
  @UseGuards(AdminGuard)
  @Post('/api/admin/hotel-rooms/')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: process.env.APP_UPLOADS_PATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createHotelRoom(
    @Res() res: any,
    @UploadedFiles(new ParseFilePipeBuilder().build({ fileIsRequired: false }))
    images: Array<Express.Multer.File>,
    @Body() params: NewRoomsParams,
  ) {
    if (!params.hotelId) {
      throw new BadRequestException(`не все обязательные поля заполнены`);
    }
    const filelinks = [];
    images &&
      images.length &&
      images.map((i) => {
        filelinks.push(i.filename);
      });
    const roomData: CreateRoomDto = {
      hotel: params.hotelId,
      description: params.description ?? 'Без описания',
      images: filelinks,
      isEnabled: true,
    };
    const newHotelRoom: iHotelRoom = await this.roomService.create(roomData);

    if (!newHotelRoom) {
      throw new HttpException('somthing wrong, 1', HttpStatus.NOT_FOUND);
    }
    const hotel = newHotelRoom.hotel as iHotel;
    const retRoom = {
      id: newHotelRoom._id,
      description: newHotelRoom.description,
      images: newHotelRoom.images,
      isEnabled: newHotelRoom.isEnabled,
      hotel: {
        id: hotel._id,
        title: hotel.title,
        description: hotel.description,
      },
    };
    res.send(retRoom);
  }

  // администраторы: Обновить описание номера
  @UseGuards(AdminGuard)
  @Put('/api/admin/hotel-rooms/:id')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: process.env.APP_UPLOADS_PATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async updateHotelRoom(
    @Res() res: any,
    @Param('id') id: string,
    @UploadedFiles(new ParseFilePipeBuilder().build({ fileIsRequired: false }))
    images: Array<Express.Multer.File>,
    @Body() data: UpdateRoomParams,
  ) {
    if (!id) {
      throw new BadRequestException(`не все обязательные поля заполнены`);
    }

    const existRoom = await this.roomService.findById(id);
    if (!existRoom) {
      throw new BadRequestException(`нет такого номера с id: ${id}`);
    }

    const arrLinks = []; // images links from body queries
    const arrUploads = []; // images links from uploads

    // collect all uploaded images
    if (images && images.length) {
      images.map((i) => {
        arrUploads.push(i.path);
      });
    }
    // collect all links from body query
    if (data.images && typeof data.images === 'string') {
      arrLinks.push(data.images);
    } else if (
      data.images &&
      typeof data.images === 'object' &&
      data.images.length
    ) {
      data.images.map((i) => {
        arrLinks.push(i);
      });
    }
    // merge all linsk and uploads togather
    const allImages = [...arrLinks, ...arrUploads];
    const uptData = {
      images: allImages,
      description: data.description,
      isEnabled: data.isEnabled,
    };
    const room: iHotelRoom = await this.roomService.update(id, uptData);
    if (!room) {
      throw new HttpException('somthing wrong, 3', HttpStatus.NOT_FOUND);
    }
    const hotel = room.hotel as iHotel;
    const retRoom = {
      id: room._id,
      description: room.description,
      images: room.images,
      isEnabled: room.isEnabled,
      hotel: {
        id: hotel._id,
        title: hotel.title,
        description: hotel.description,
      },
    };
    res.send(retRoom);
  }

  /**
   *
   *  ALL USERS
   *
   */

  // Поиск номеров
  // всем: только доступные номера
  // админам и менеджерам: все номера по умолчанию или как в параметрах
  @Get('/api/common/hotel-rooms')
  async searchRooms(
    @Res() res: any,
    @Query() params: SearchRoomsParams,
    @Session() ses: any,
  ) {
    const isAuthorized = ses.passport && ses.passport.user;
    const role = isAuthorized ? ses.passport.user.role : '';
    const isEnabled = params.isEnabled ?? false;
    const powerUsers = isAuthorized && (role === 'admin' || role === 'manager');

    const searchParams: SearchRoomsParams = {
      limit: (params && params.limit) ?? 0,
      offset: (params && params.offset) ?? 0,
      isEnabled: powerUsers ? isEnabled : true,
      hotel: params.hotel ?? undefined,
    };
    const rooms = await this.roomService.search(searchParams);
    if (!rooms) {
      throw new HttpException('somthing wrong', HttpStatus.NOT_FOUND);
    }

    const retRooms = rooms.map((room) => {
      const hotel = room.hotel as iHotel;
      return {
        id: room._id,
        description: room.description ?? '',
        images: room.images ?? [],
        hotel: { id: hotel._id, title: hotel.title },
      };
    });
    res.send(retRooms);
  }

  // информация о номере (по id)
  @Get('/api/common/hotel-rooms/:id')
  async getRoomById(@Res() res: any, @Param('id') id: string) {
    const room = await this.roomService.findById(id);
    if (!room) {
      throw new BadRequestException(`Комнаты с id ${id} не существует`);
    }
    const hotel = room.hotel as iHotel;
    const retRoom = {
      id: room._id,
      description: room.description,
      images: room.images ?? [],
      hotel: {
        id: hotel._id,
        title: hotel.title,
        description: hotel.description,
      },
    };
    console.log('retRoom', retRoom);
    res.send(retRoom);
  }
}
