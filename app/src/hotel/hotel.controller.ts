import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Query,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { SearchHotelParams, iHotelResponse } from './dto/abstract-hotel.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelParams } from './dto/update-hotel.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@UsePipes(new ValidationPipe())
@Controller()
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  // 2.1.4. Получение списка гостиниц
  @UseGuards(AdminGuard)
  @Get('/api/admin/hotels')
  async findAllHotels(
    @Query() params: SearchHotelParams,
  ): Promise<iHotelResponse[]> {
    return await this.hotelService.search(params);
  }

  // 2.1.3. Добавление гостиницы
  @UseGuards(AdminGuard)
  @Post('/api/admin/hotels/')
  async createHotel(@Body() data: CreateHotelDto): Promise<iHotelResponse> {
    return await this.hotelService.create(data);
  }

  // 2.1.5. Изменение описания гостиницы
  @UseGuards(AdminGuard)
  @Put('/api/admin/hotels/:id')
  async updateHotel(
    @Param('id') id: string,
    @Body() data: UpdateHotelParams,
  ): Promise<iHotelResponse> {
    return await this.hotelService.update(id, data);
  }
}
