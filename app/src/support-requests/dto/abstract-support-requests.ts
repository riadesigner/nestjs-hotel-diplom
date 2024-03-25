import { ObjectId } from 'mongoose';
import { CreateSupportRequestDto } from './create-support-request.dto';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { iUser } from 'src/users/entities/user.entity';
import { UserPayload } from 'src/users/dto/abstract-user';

export type ID = string | ObjectId;

export interface iSupportSubscriber {
  supportRequestId: ID;
  wsClientId: ID;
  fn: () => void;
}

// export interface iSupportSubscribePayload {
//   suportRequestId: ID;
//   message: iMessage;
// }

// --------------- ENTITIES --------------- //

export interface iMessage {
  _id?: ID;
  author: ID | iUser;
  sentAt: Date;
  text: string;
  readAt: Date | null;
}

export interface iSupportRequest {
  _id?: ID;
  user: ID | iUser;
  createdAt: Date;
  messages?: ID[] | iMessage[];
  isActive?: boolean;
}

// --------------- RESPONSE API --------------- //

export interface iMessageResponse {
  id: ID;
  createdAt: Date;
  text: string;
  readAt: Date | null;
  author: {
    id: ID | iUser;
    name: string;
  };
}

export interface iSupportRequestsResponse {
  id: ID;
  createdAt: Date;
  isActive: boolean;
  hasNewMessages: boolean;
}

export interface iSupportRequestsForManagerResponse {
  id: ID;
  createdAt: Date;
  isActive: boolean;
  hasNewMessages: boolean;
  client: {
    id: ID | iUser;
    name: string;
    email: string;
    contactPhone: string;
  };
}

// --------------- DTO, PARAMS --------------- //

export interface SendMessageDto {
  author: ID | iUser;
  supportRequest: ID;
  text: string;
}
export interface MarkMessagesAsReadDto {
  user: ID | iUser;
  supportRequest: ID;
  createdBefore: Date;
}
export interface GetChatListParams {
  user: ID | null;
  isActive: boolean;
}

export class MessagesReadParam {
  @IsDefined()
  @IsDateString()
  createdBefore: Date;
}

export class SendMessageParam {
  @IsDefined()
  @IsString()
  text: string;
}

export class GetSupportRequestsListParams {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export interface iSupportRequestService {
  findSupportRequests(params: GetChatListParams): Promise<iSupportRequest[]>;
  sendMessage(data: SendMessageDto): Promise<iMessageResponse>;
  getMessages(
    user: UserPayload,
    supportRequest: ID,
  ): Promise<iMessageResponse[]>;
  messagesRead(params: MarkMessagesAsReadDto): Promise<void>;
  subscribe(
    handler: (
      supportRequest: iSupportRequest,
      message: iMessage,
    ) => Promise<void>,
  ): Promise<() => void>;
}

export interface iSupportRequestClientService {
  createSupportRequest(
    data: CreateSupportRequestDto,
  ): Promise<iSupportRequestsResponse[]>;
  markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<boolean | null>;
  getUnreadCount(supportRequest: ID): Promise<number>;
  findSupportRequest(
    userId: ID,
    params: GetSupportRequestsListParams,
  ): Promise<iSupportRequestsResponse[]>;
}

export interface iSupportRequestEmployeeService {
  markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<boolean | null>;
  getUnreadCount(supportRequest: ID): Promise<number>;
  closeRequest(supportRequest: ID): Promise<boolean | null>;
  getAllSupRequests(
    params: GetSupportRequestsListParams,
  ): Promise<iSupportRequestsForManagerResponse[]>;
}
