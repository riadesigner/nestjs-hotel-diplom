import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GetSupportRequestsListParams,
  ID,
  MarkMessagesAsReadDto,
  iMessage,
  iSupportRequest,
  iSupportRequestEmployeeService,
  iSupportRequestsForManagerResponse,
  iSupportRequestsResponse,
} from './dto/abstract-support-requests';
import { InjectModel } from '@nestjs/mongoose';
import {
  Message,
  MessageDocument,
  SupportRequest,
  SupportRequestDocument,
} from './support-requests-schema';
import { Model } from 'mongoose';
import { iUser } from 'src/users/entities/user.entity';

@Injectable()
export class SupportRequestEmployeeService
  implements iSupportRequestEmployeeService
{
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequestDocument>,
  ) {}

  // выставляет текущую дату в поле readAt всем сообщениям,
  // которые не были прочитаны и были отправлены пользователем.
  async markMessagesAsRead(
    params: MarkMessagesAsReadDto,
  ): Promise<boolean | null> {
    try {
      const supReq = await this.supportRequestModel.findById(
        params.supportRequest,
      );

      for (const i in supReq.messages) {
        const m = supReq.messages[i] as iMessage;
        if (m.author.toString() === params.user.toString() && !m.readAt) {
          m.sentAt = new Date();
        }
      }
      return true;
    } catch (e) {
      console.log('error log', e);
      return null;
    }
  }

  async getAllSupRequests(
    params: GetSupportRequestsListParams,
  ): Promise<iSupportRequestsForManagerResponse[]> {
    try {
      const opt = {};
      if (params.isActive !== undefined) {
        opt['isActive'] = params.isActive;
      }
      const offset = params.offset ?? 0;
      const limit = params.limit ?? 0;
      const arrSupRequests = await this.supportRequestModel
        .find(opt)
        .limit(limit)
        .skip(offset)
        .populate('messages')
        .populate({
          path: 'messages',
          populate: {
            path: 'author',
            model: 'User',
          },
        })
        .lean()
        .populate('user')
        .select('-__v')
        .exec();

      // MAKE RESPONSE ANSWER
      const retData = arrSupRequests.map((s) => {
        const user = s.user as iUser;
        // ищем непрочитанные сообщения
        let hasNewMessages = false;
        const messages = s.messages as iMessage[];
        if (messages && messages.length) {
          // считаем непрочитанные сообщения
          const arrNewMsg = messages.filter((m) => !m.readAt);
          if (arrNewMsg && arrNewMsg.length) {
            hasNewMessages = true;
          }
        }
        const data: iSupportRequestsForManagerResponse = {
          id: s._id,
          createdAt: s.createdAt,
          isActive: s.isActive,
          hasNewMessages: hasNewMessages,
          client: {
            id: user._id,
            name: user.name,
            email: user.email,
            contactPhone: user.contactPhone,
          },
        };
        return data;
      });
      return retData;
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException(
        `невозможно получить список обращений в поддержку`,
      );
    }
  }

  // возвращает количество сообщений, которые были отправлены пользователем и не отмечены прочитанными.
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
      let unreadMessage = 0;
      for (const i in supReq.messages) {
        const m = supReq.messages[i] as iMessage;
        const user = m.author as iUser;
        if (!m.readAt && user.role === 'client') {
          unreadMessage++;
        }
      }
      return unreadMessage;
    } catch (e) {
      console.log('error log', e);
      return null;
    }
  }
  // меняет флаг isActive на false.
  async closeRequest(supportRequest: ID): Promise<boolean | null> {
    try {
      const supReq = await this.supportRequestModel.findById(supportRequest);
      supReq.isActive = true;
      supReq.save();
      return true;
    } catch (e) {
      console.log('error log', e);
      return null;
    }
  }
}
