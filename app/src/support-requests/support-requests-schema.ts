import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { iSupportRequest, ID, iMessage } from './dto/abstract-support-requests';
import { User } from 'src/users/users.schema';
import { iUser } from 'src/users/entities/user.entity';

export type SupportRequestDocument = iSupportRequest & Document;
export type MessageDocument = iMessage & Document;

@Schema()
export class Message implements iMessage {
  @Prop({ type: String, ref: User.name })
  author: ID | iUser;
  @Prop()
  sentAt: Date;
  @Prop()
  text: string;
  @Prop()
  readAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema()
export class SupportRequest implements iSupportRequest {
  @Prop({ type: String, ref: User.name })
  user: ID | iUser;
  @Prop()
  createdAt: Date;
  @Prop()
  messages?: ID[] | iMessage[];
  @Prop()
  isActive?: boolean;
}

export const SupportRequestSchema =
  SchemaFactory.createForClass(SupportRequest);
