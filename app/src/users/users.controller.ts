import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { iUserResponse, iUsersService } from './dto/abstract-user';
import { SearchUserParams } from './dto/search-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ManagerGuard } from 'src/auth/guards/manager.guard';

@UsePipes(new ValidationPipe())
@Controller()
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: iUsersService,
  ) {}

  // 2.3.3. Регистрация
  @Post('/api/client/register')
  async userRegistration(@Body() data: CreateUserDto): Promise<iUserResponse> {
    return await this.usersService.create(data);
  }

  // 2.4.1. Создание пользователя
  @UseGuards(AdminGuard)
  @Post('/api/admin/users/')
  async createUserByAdmin(@Body() data: CreateUserDto): Promise<iUserResponse> {
    return await this.usersService.create(data);
  }

  //  2.4.2. Получение списка пользователей, admin
  @UseGuards(AdminGuard)
  @Get('/api/admin/users/')
  async getAllUsersByAdmin(
    @Query() params: SearchUserParams,
  ): Promise<iUserResponse[]> {
    return await this.usersService.findAll(params);
  }

  //  2.4.2. Получение списка пользователей, manager
  @UseGuards(ManagerGuard)
  @Get('/api/manager/users/')
  async getAllUsersByManager(
    @Query() params: SearchUserParams,
  ): Promise<iUserResponse[]> {
    return await this.usersService.findAll(params);
  }
}
