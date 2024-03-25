import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Session,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientGuard } from 'src/auth/guards/client.guard';
import { UsersService } from 'src/users/users.service';
import { SupportRequestClientService } from './support-requests-client.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import {
  iSupportRequestsResponse,
  GetSupportRequestsListParams,
  iSupportRequestsForManagerResponse,
  SendMessageDto,
  SendMessageParam,
  MessagesReadParam,
  MarkMessagesAsReadDto,
  iMessageResponse,
} from './dto/abstract-support-requests';
import { ManagerGuard } from 'src/auth/guards/manager.guard';
import { SupportRequestEmployeeService } from './support-requests-employee.service';
import { CommonGuard } from 'src/auth/guards/common.guard';
import { SupportRequestService } from './support-requests.service';
import { UserPayload } from 'src/users/dto/abstract-user';

@UsePipes(new ValidationPipe())
@Controller()
export class SupportRequestsController {
  constructor(
    private readonly userService: UsersService,
    private readonly clientSupRequest: SupportRequestClientService,
    private readonly managerSupRequest: SupportRequestEmployeeService,
    private readonly commonSupRequest: SupportRequestService,
  ) {}

  // 2.5.1. Создание обращения в поддержку
  @UseGuards(ClientGuard)
  @Post('/api/client/support-requests')
  async clientCreateMessage(
    @Body() data: { text: string },
    @Session() ses: any,
  ): Promise<iSupportRequestsResponse[]> {
    const param: CreateSupportRequestDto = {
      user: ses.passport.user._id,
      text: data.text,
    };
    return await this.clientSupRequest.createSupportRequest(param);
  }

  // 2.5.2. Получение списка обращений в поддержку для клиента
  @UseGuards(ClientGuard)
  @Get('/api/client/support-requests')
  async clientGetAllRequests(
    @Session() ses: any,
    @Query() params: GetSupportRequestsListParams,
  ): Promise<iSupportRequestsResponse[]> {
    const userId = ses.passport.user._id;
    return await this.clientSupRequest.findSupportRequest(userId, params);
  }

  // 2.5.3. Получение списка обращений в поддержку для менеджера
  @UseGuards(ManagerGuard)
  @Get('/api/manager/support-requests')
  async managerGetAllRequests(
    @Query() params: GetSupportRequestsListParams,
  ): Promise<iSupportRequestsForManagerResponse[]> {
    return await this.managerSupRequest.getAllSupRequests(params);
  }

  // 2.5.4. Получение истории сообщений из обращения в техподдержку
  @UseGuards(CommonGuard)
  @Get('/api/common/support-requests/:id/messages')
  async commonGetMessages(
    @Session() ses: any,
    @Param('id') supportRequestId: string,
  ): Promise<iMessageResponse[]> {
    const user: UserPayload = {
      _id: ses.passport.user._id,
      role: ses.passport.user.role,
    };
    return await this.commonSupRequest.getMessages(user, supportRequestId);
  }

  // 2.5.5. Отправка сообщения
  @UseGuards(CommonGuard)
  @Post('/api/common/support-requests/:id/messages')
  async commonSendMessage(
    @Session() ses: any,
    @Param('id') id: string,
    @Body() data: SendMessageParam,
  ) {
    const user = await this.userService.findById(ses.passport.user._id);
    const supRequest = await this.commonSupRequest.getSupportRequestById(id);
    const param: SendMessageDto = {
      author: user,
      supportRequest: supRequest._id,
      text: data.text,
    };
    return await this.commonSupRequest.sendMessage(param);
  }

  // 2.5.6. Отправка события, что сообщения прочитаны
  @UseGuards(CommonGuard)
  @Post('/api/common/support-requests/:id/messages/read')
  async commonMessagesRead(
    @Session() ses: any,
    @Param('id') id: string,
    @Body() data: MessagesReadParam,
  ) {
    const params: MarkMessagesAsReadDto = {
      user: ses.passport.user._id,
      supportRequest: id,
      createdBefore: data.createdBefore,
    };
    await this.commonSupRequest.messagesRead(params);
    return { success: true };
  }
}
