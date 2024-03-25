import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Inject,
  HttpException,
} from '@nestjs/common';

import { LocalGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { LoggedInGuard } from './guards/logged-in.guard';
import { UsersService } from '../users/users.service';
import { iUsersService } from 'src/users/dto/abstract-user';

@UsePipes(new ValidationPipe())
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: iUsersService,
  ) {}

  /**
   *  Authorisation
   * */
  @UseGuards(LocalGuard)
  @Post('/api/auth/login')
  async login(@Req() req: any) {
    const u = req.session.passport.user;
    try {
      const foundUser = await this.usersService.findById(u._id);
      const retUser = {
        email: foundUser.email,
        name: foundUser.name,
        contactPhone: foundUser.contactPhone,
      };
      return retUser;
    } catch (e) {
      throw new HttpException('Неправильные логин или пароль ', 401);
    }
  }

  @UseGuards(LoggedInGuard)
  @Get('/api/auth/logout')
  async logout(@Req() req) {
    await req.logout((): void => {});
    return { session: 'ended' };
  }
}
