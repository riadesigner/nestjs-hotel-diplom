import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GetSupportRequestsListParams,
  ID,
  MarkMessagesAsReadDto,
  iMessage,
  iSupportRequest,
  iSupportRequestClientService,
  iSupportRequestsResponse,
} from './dto/abstract-support-requests';
import { InjectModel } from '@nestjs/mongoose';
import {
  Message,
  MessageDocument,
  SupportRequest,
  SupportRequestDocument,
} from './support-requests-schema';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { Model } from 'mongoose';
import { iUser } from 'src/users/entities/user.entity';

@Injectable()
export class SupportRequestClientService
  implements iSupportRequestClientService
{
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequestDocument>,
  ) {}

  async createSupportRequest(
    data: CreateSupportRequestDto,
  ): Promise<iSupportRequestsResponse[]> {
    try {
      const dataMessage = {
        author: data.user,
        text: data.text,
        sentAt: new Date(),
        readAt: '',
      };

      const newMessage = new this.messageModel(dataMessage);
      await newMessage.save();

      const dataSupportRequest = {
        user: data.user,
        createdAt: new Date(),
        messages: [newMessage._id],
        isActive: true,
      };

      const supReq = new this.supportRequestModel(dataSupportRequest);
      await supReq.save();

      // MAKE RESPONSE ANSWER
      const retData: iSupportRequestsResponse = {
        id: supReq._id,
        createdAt: supReq.createdAt,
        isActive: supReq.isActive,
        hasNewMessages: false,
      };

      return [retData];
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException('не удалось создать обращение в поддержку');
    }
  }

  async findSupportRequest(
    userId: ID,
    params: GetSupportRequestsListParams,
  ): Promise<iSupportRequestsResponse[]> {
    try {
      const opt = { user: userId };
      if (params.isActive !== undefined) {
        opt['isActive'] = params.isActive;
      }
      const limit = params.limit ?? 0;
      const offset = params.offset ?? 0;

      const supReq = await this.supportRequestModel
        .find(opt)
        .limit(limit)
        .skip(offset)
        .populate('messages')
        .select('-__v')
        .lean()
        .exec();

      // MAKE RESPONSE ANSWER
      const retData: iSupportRequestsResponse[] = supReq.map((s) => {
        let hasNewMessages = false;
        const messages = s.messages as iMessage[];
        if (messages && messages.length) {
          // считаем непрочитанные сообщения
          const arrNewMsg = messages.filter((m) => !m.readAt);
          if (arrNewMsg && arrNewMsg.length) {
            hasNewMessages = true;
          }
        }
        const data: iSupportRequestsResponse = {
          id: s._id,
          createdAt: s.createdAt,
          isActive: s.isActive,
          hasNewMessages: hasNewMessages,
        };
        return data;
      });
      return retData;
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException(
        `невозможно найти запросы в поддержку от пользователя ${userId}`,
      );
    }
  }
  // выставляет текущую дату в поле readAt всем сообщениям, которые не были прочитаны и были отправлены не пользователем.
  async markMessagesAsRead(
    params: MarkMessagesAsReadDto,
  ): Promise<boolean | null> {
    try {
      const supReq = await this.supportRequestModel.findById(
        params.supportRequest,
      );
      for (const i in supReq.messages) {
        const m = supReq.messages[i] as iMessage;
        if (m.author.toString() !== params.user.toString() && !m.readAt) {
          m.readAt = new Date();
        }
      }
      supReq.markModified('messages');
      supReq.save();
      return true;
    } catch (e) {
      console.log('error log', e);
      return null;
    }
  }
  // возвращает количество сообщений, которые были отправлены любым сотрудником поддержки и не отмечены прочитанным.
  async getUnreadCount(supportRequest: ID): Promise<number> {
    try {
      const supReq = await this.supportRequestModel
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
        .exec();
      let allunread = 0;
      for (const i in supReq.messages) {
        const m = supReq.messages[i] as iMessage;
        const user = m.author as iUser;
        if (user.role !== 'client' && !m.readAt) {
          allunread++;
        }
      }
      return allunread;
    } catch (e) {
      console.log('error log', e);
      return null;
    }
  }
}
