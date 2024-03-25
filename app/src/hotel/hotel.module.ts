import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelRoomService } from './hotel.room.service';
import { Hotel, HotelRoom, HotelRoomSchema, HotelSchema } from './hotel.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelRoomsController } from './hotel.rooms.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
  ],
  providers: [HotelService, HotelRoomService],
  controllers: [HotelController, HotelRoomsController],
  exports: [HotelService, HotelRoomService],
})
export class HotelModule {}
