import { ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { iUser } from '../entities/user.entity';
import { SearchUserParams } from './search-user.dto';

export type UserRole = 'client' | 'admin' | 'manager';
export type ID = string | ObjectId;
export type UserPayload = { _id: ID; role: string };

export interface iUserResponse {
  id: ID;
  email: string;
  name: string;
  contactPhone?: string;
  role?: UserRole;
}

@Injectable()
export abstract class iUsersService {
  abstract create(data: CreateUserDto): Promise<iUserResponse>;
  abstract findById(id: ID): Promise<iUser | null>;
  abstract findByEmail(email: string): Promise<iUser | null>;
  abstract findAll(params: SearchUserParams): Promise<iUserResponse[]>;
  abstract update(id: string, dto: UpdateUserDto): Promise<iUser | null>;
  abstract remove(id: string): Promise<boolean>;
}
