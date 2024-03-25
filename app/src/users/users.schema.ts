import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { iUser } from './entities/user.entity';
import { UserRole } from './dto/abstract-user';

export type UserDocument = User & Document;

@Schema()
export class User implements iUser {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  name: string;
  @Prop()
  contactPhone?: string;
  @Prop()
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
