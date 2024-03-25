import { Controller, Get, Render, Session, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggedInGuard } from './auth/guards/logged-in.guard';
import { AdminGuard } from './auth/guards/admin.guard';
import { ManagerGuard } from './auth/guards/manager.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async root() {
    return { message: await this.appService.getPublicMessage() };
  }

  @UseGuards(LoggedInGuard)
  @Get('protected')
  async guardedRoute() {
    return { message: await this.appService.getPrivateMessage() };
  }

  @UseGuards(AdminGuard)
  @Get('admin')
  async getAdminMessage() {
    return { message: await this.appService.getAdminMessage() };
  }

  @UseGuards(ManagerGuard)
  @Get('manager')
  async getManagerMessage() {
    return { message: await this.appService.getManagerMessage() };
  }

  // СТРАНИЦА ВХОДА/РЕГИСТРАЦИИ
  @Get('login')
  @Render('login')
  async getLoginPage(@Session() ses) {
    const user = ses.passport && ses.passport.user ? ses.passport.user : false;
    return { user };
  }

  // СТРАНИЦА ЧАТА
  @UseGuards(LoggedInGuard)
  @Get('chat')
  @Render('chat')
  async getChatPage(@Session() ses) {
    const user = await this.appService.getChatPage(ses.passport.user);
    return { user };
  }
}
