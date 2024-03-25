import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { SupportRequestService } from './support-requests.service';
import { Socket } from 'socket.io';
import { SupportRequest } from './support-requests-schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UseGuards } from '@nestjs/common';
import { LoginWsGuard } from 'src/auth/guards/auth.guard-ws';
import { iUser } from 'src/users/entities/user.entity';
import { UserPayload } from 'src/users/dto/abstract-user';
import {
  ID,
  iMessage,
  iSupportSubscriber,
} from './dto/abstract-support-requests';

@WebSocketGateway()
export class SupportGateway {
  private arrSubscribers: iSupportSubscriber[] = [];

  constructor(
    private readonly supportRequestService: SupportRequestService,
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequest>,
  ) {}

  @SubscribeMessage('subscribeToChat')
  @UseGuards(LoginWsGuard)
  async handleSubscribeToChat(
    @MessageBody() body: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const hand = client.handshake as any;
      const userSaved = hand.session.passport.user as UserPayload;

      const supportRequest = await this.supportRequestModel.findById(
        body.chatId,
      );
      if (!supportRequest) {
        client.emit(
          'chat.exception',
          `обращения c номером ${body.chatId} не существует`,
        );
        return {};
      }

      if (
        userSaved.role === 'client' &&
        supportRequest.user.toString() !== userSaved._id.toString()
      ) {
        client.emit(
          'chat.exception',
          `У вас нет доступа к обращению c ID ${body.chatId}`,
        );
        return {};
      }

      const subscribe = this.arrSubscribers.find((s) => {
        return (
          s.wsClientId.toString() === client.id.toString() &&
          s.supportRequestId.toString() === body.chatId.toString()
        );
      });

      if (!subscribe) {
        console.log('НОВЫЙ СЛУШАТЕЛЬ', client.id);

        const unsubscribe = await this.supportRequestService.subscribe(
          async (supportRequest: ID, message: iMessage) => {
            if (supportRequest.toString() === body.chatId.toString()) {
              const author = message.author as iUser;
              const messageData = {
                supportRequest: supportRequest,
                id: message._id.toString(),
                createdAt: message.sentAt,
                text: message.text,
                readAt: message.readAt ? message.readAt : null,
                author: {
                  id: author._id,
                  name: author.name,
                },
              };
              client.emit('chat.msgToClient', messageData);
            }
          },
        );

        this.arrSubscribers.push({
          supportRequestId: body.chatId,
          wsClientId: client.id,
          fn: unsubscribe,
        });

        const response = {
          name: 'server',
          text: `SUBSCRIBE NEW FOR THE: ${client.id}, chatId ${body.chatId}`,
        };
        return response;
      } else {
        client.emit('chat.exception', `уже подписаны`);
      }
    } catch (error) {
      console.log('error log', error.message);
      client.emit('chat.exception', `ошибка сервера`);
      return {};
    }
  }

  afterInit() {
    console.log('ChatGateway Init');
  }

  handleDisconnect(client: Socket) {
    const subs = this.arrSubscribers.filter((s) => {
      return s.wsClientId.toString() === client.id.toString();
    });
    // UNSUBSCRIBING ALL FOR THE CLIENT
    if (subs && subs.length) {
      console.log(`REMOVE SUBSCRIBES FOR ${client.id}`);
      subs.map((s) => s.fn());
    }
    console.log(`Disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
  }
}
