import { BadRequestException, Injectable } from '@nestjs/common';

import {
  GetChatListParams,
  ID,
  SendMessageDto,
  iMessage,
  iSupportRequest,
  iSupportRequestService,
  MarkMessagesAsReadDto,
  iMessageResponse,
} from './dto/abstract-support-requests';
import {
  Message,
  MessageDocument,
  SupportRequest,
  SupportRequestDocument,
} from './support-requests-schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserPayload } from 'src/users/dto/abstract-user';
import { iUser } from 'src/users/entities/user.entity';
import {
  SupportEmitterEvents,
  SupportEventEmitter,
} from 'src/event-emitter/emitter';

@Injectable()
export class SupportRequestService implements iSupportRequestService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequestDocument>,
  ) {}
  async getSupportRequestById(id: ID): Promise<iSupportRequest | null> {
    try {
      return await this.supportRequestModel.findById(id);
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException(`не найден запрос с ID: ${id}`);
    }
  }
  async findSupportRequests(
    params: GetChatListParams,
  ): Promise<iSupportRequest[]> {
    const allSupReq = this.supportRequestModel.find({
      user: params.user,
      isActive: params.isActive,
    });
    return allSupReq;
  }
  async sendMessage(data: SendMessageDto): Promise<iMessageResponse> {
    try {
      const user = data.author as iUser;

      const newMessage: iMessage = {
        author: user._id,
        sentAt: new Date(),
        text: data.text,
        readAt: null,
      };
      const supRequest = await this.supportRequestModel.findById(
        data.supportRequest,
      );

      if (
        user.role === 'client' &&
        supRequest.user.toString() !== user._id.toString()
      ) {
        throw new BadRequestException(`wrong user`);
      }

      const msg = new this.messageModel(newMessage);
      await msg.save().then((t) => t.populate('author'));

      supRequest.messages.push(msg._id);
      await supRequest.save();

      SupportEventEmitter.emit(
        SupportEmitterEvents.MESSAGE_CREATED,
        supRequest._id,
        msg,
      );

      // MAKE RESPONSE ANSWER
      const retMsg: iMessageResponse = {
        id: msg._id,
        createdAt: msg.sentAt,
        text: msg.text,
        readAt: msg.readAt,
        author: {
          id: user._id,
          name: user.name,
        },
      };
      return retMsg;
    } catch (e) {
      console.log('error log', e);
      const cause =
        e.message === 'wrong user'
          ? 'только для пользователя, создавшего запрос в поддержку'
          : '';
      throw new BadRequestException(
        `не удалось добавить сообщение в обращение с ID: ${data.supportRequest}, ${cause}`,
      );
    }
  }

  async getMessages(
    user: UserPayload,
    supportRequest: ID,
  ): Promise<iMessageResponse[]> {
    try {
      const supRequest = await this.supportRequestModel
        .findById(supportRequest)
        .lean()
        .populate('messages')
        .populate({
          path: 'messages',
          populate: {
            path: 'author',
            model: 'User',
          },
        })
        .select('-__v')
        .exec();

      if (
        user.role === 'client' &&
        user._id.toString() !== supRequest._id.toString()
      ) {
        throw new BadRequestException(
          `или клиент не является автором запроса в поддержку`,
        );
      }

      // MAKE RESPONSE ANSWER
      const retArrMessages = supRequest.messages.map((m) => {
        const user = m.author as iUser;
        const msg: iMessageResponse = {
          id: m._id,
          createdAt: m.sentAt,
          text: m.text,
          readAt: m.readAt,
          author: {
            id: user._id,
            name: user.name,
          },
        };
        return msg;
      });
      return retArrMessages;
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException(
        `не найдено обращение с ID: ${supportRequest}`,
      );
    }
  }

  async messagesRead(params: MarkMessagesAsReadDto): Promise<void> {
    try {
      const supReq = await this.supportRequestModel.findById(
        params.supportRequest,
      );

      for (const i in supReq.messages) {
        const m = supReq.messages[i] as iMessage;
        if (
          m.author.toString() !== params.user.toString() &&
          !m.readAt &&
          new Date(m.sentAt).getTime() <
            new Date(params.createdBefore).getTime()
        ) {
          m.readAt = new Date();
          console.log(m.readAt);
        }
      }
      supReq.markModified('messages');
      await supReq.save();
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException(
        `невозможно обновить сообщения для обращения с ID: ${params.supportRequest}`,
      );
    }
  }

  async subscribe(handler) {
    console.log('subscribe handler', handler);
    SupportEventEmitter.on(
      SupportEmitterEvents.MESSAGE_CREATED,
      (supportRequest: ID, message: MessageDocument) => {
        handler(supportRequest, message);
      },
    );
    return () => {
      SupportEventEmitter.off(SupportEmitterEvents.MESSAGE_CREATED, handler);
    };
  }
}
