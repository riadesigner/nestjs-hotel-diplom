import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Res,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Post,
  Session,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  CreateReservationParams,
  ReservationSearchOptions,
  ReturnedReservation,
} from './dto/abstract-reservation';
import { HotelRoomService } from 'src/hotel/hotel.room.service';
import { iHotel, iHotelRoom } from 'src/hotel/entities/hotel.entity';
import { ClientGuard } from 'src/auth/guards/client.guard';
import { ManagerGuard } from 'src/auth/guards/manager.guard';
import { UsersService } from 'src/users/users.service';

@UsePipes(new ValidationPipe())
@Controller()
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly roomService: HotelRoomService,
    private readonly usersService: UsersService,
  ) {}

  // 2.2.4. Список броней конкретного пользователя / ready
  @UseGuards(ManagerGuard)
  @Get('/api/manager/reservations/:userId')
  async getReservationsForManager(
    @Res() res: any,
    @Param('userId') userId: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException(
        `пользователя с id ${userId} не существует`,
      );
    }
    const filter: ReservationSearchOptions = { userId };
    const allReservations =
      await this.reservationService.getReservations(filter);
    if (!allReservations) {
      throw new HttpException(
        'something wrong 1',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const answ = allReservations.map((t) => {
      const hotelRoom = t.roomId as iHotelRoom;
      const hotel = t.hotelId as iHotel;
      const retRes: ReturnedReservation = {
        startDate: t.dateStart,
        endDate: t.dateEnd,
        hotelRoom: {
          description: hotelRoom.description,
          images: hotelRoom.images,
        },
        hotel: {
          title: hotel.title,
          description: hotel.description,
        },
      };
      return retRes;
    });

    res.send(answ);
  }

  // 2.2.2. Список броней текущего пользователя / ready
  @UseGuards(ClientGuard)
  @Get('/api/client/reservations')
  async getReservationsForClient(@Res() res: any, @Session() ses: any) {
    const userId =
      ses.passport && ses.passport.user ? ses.passport.user._id : null;
    if (!userId) {
      throw new BadRequestException(`пользователь не авторизирован`);
    }
    const filter: ReservationSearchOptions = { userId };
    const allReservations =
      await this.reservationService.getReservations(filter);
    if (!allReservations) {
      throw new HttpException(
        'something wrong 5',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const answ = allReservations.map((t) => {
      const hotelRoom = t.roomId as iHotelRoom;
      const hotel = t.hotelId as iHotel;
      const retRes: ReturnedReservation = {
        startDate: t.dateStart,
        endDate: t.dateEnd,
        hotelRoom: {
          description: hotelRoom.description,
          images: hotelRoom.images,
        },
        hotel: {
          title: hotel.title,
          description: hotel.description,
        },
      };
      return retRes;
    });

    res.send(answ);
  }

  // 2.2.1. Бронирование номера клиентом / ready
  @UseGuards(ClientGuard)
  @Post('/api/client/reservations')
  async addReservations(
    @Res() res: any,
    @Body() data: CreateReservationDto,
    @Session() ses: any,
  ) {
    const userId =
      ses.passport && ses.passport.user ? ses.passport.user._id : null;
    if (!userId) {
      throw new BadRequestException(`пользователь не авторизирован`);
    }
    if (!data.roomId || !data.dateEnd || !data.dateStart) {
      throw new BadRequestException(`не все обязательные поля заполнены`);
    }
    const room = await this.roomService.findById(data.roomId);
    if (!room) {
      throw new HttpException(`номер с id ${data.roomId} не найден`, 400);
    }
    if (!room.isEnabled) {
      throw new HttpException(`номер с id ${data.roomId} занят`, 400);
    }
    const hotel = room.hotel as iHotel;
    const params: CreateReservationParams = {
      userId,
      hotelId: hotel._id,
      ...data,
    };
    const newReserve = await this.reservationService.addReservation(params);
    if (!newReserve) {
      throw new HttpException(
        'something wrong 2',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const answ: ReturnedReservation = {
      startDate: newReserve.dateStart,
      endDate: newReserve.dateEnd,
      hotelRoom: {
        description: room.description,
        images: room.images,
      },
      hotel: {
        title: hotel.title,
        description: hotel.description,
      },
    };
    res.json(answ);
  }

  // 2.2.3. Отмена бронирования клиентом / ready
  @UseGuards(ClientGuard)
  @Delete('/api/client/reservations/:id')
  async remove(
    @Res() res: any,
    @Session() ses: any,
    @Param('id') reservarionId: string,
  ) {
    const userId =
      ses.passport && ses.passport.user ? ses.passport.user._id : null;
    if (!userId) {
      throw new BadRequestException(`пользователь не авторизирован`);
    }
    if (!reservarionId) {
      throw new BadRequestException(`не все обязательные поля заполнены`);
    }
    const reservation = await this.reservationService.findById(reservarionId);
    if (!reservation) {
      throw new HttpException('такой брони не существует', 400);
    }
    if (reservation.userId !== userId) {
      throw new HttpException('доступ запрещен', 403);
    }
    const ok = await this.reservationService.removeReservation(reservarionId);
    if (!ok) {
      throw new HttpException(
        'something wrong 3',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    res.send('ok'); // or void
  }

  // 2.2.5. Отмена бронирования менеджером / ready
  @UseGuards(ManagerGuard)
  @Delete('/api/manager/reservations/:reservarionId')
  async removeByReservId(
    @Res() res: any,
    @Param('reservarionId') reservarionId: string,
  ) {
    if (!reservarionId) {
      throw new BadRequestException(`не все обязательные поля заполнены`);
    }
    const reservation = await this.reservationService.findById(reservarionId);
    if (!reservation) {
      throw new HttpException('такой брони не существует', 400);
    }
    const ok = await this.reservationService.removeReservation(reservarionId);
    if (!ok) {
      throw new HttpException(
        'something wrong 4',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    res.send('ok'); // or void
  }
}
