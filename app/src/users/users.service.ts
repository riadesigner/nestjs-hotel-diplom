import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { iUser } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { iUsersService, ID, iUserResponse } from './dto/abstract-user';
import { SearchUserParams } from './dto/search-user.dto';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService implements iUsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: CreateUserDto): Promise<iUserResponse> {
    if (data.password !== data.confirmationPassword) {
      throw new BadRequestException('пароли не совпадают');
    }

    const existUser = await this.findByEmail(data.email);
    if (existUser) {
      throw new BadRequestException(
        `пользователь с почтой ${data.email} уже зарегистрирован`,
      );
    }
    data.role = data.role ?? 'client';

    const preUser = {
      email: data.email,
      passwordHash: await hash(data.password, 12),
      name: data.name,
      role: data.role,
    };

    try {
      const newUser = new this.userModel(preUser);
      newUser.save();

      const retUser: iUserResponse = {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        contactPhone: newUser.contactPhone,
      };
      return retUser;
    } catch (e) {
      throw new BadRequestException(`не удалось создать пользователя`);
    }
  }

  async findAll(params: SearchUserParams): Promise<iUserResponse[]> {
    try {
      const opt = {};

      console.log('params', params);
      if (params && params.email) {
        opt['email'] = { $regex: params.email, $options: 'i' };
      }
      if (params && params.name) {
        opt['name'] = { $regex: params.name, $options: 'i' };
      }
      if (params && params.contactPhone) {
        opt['contactPhone'] = { $regex: params.contactPhone, $options: 'i' };
      }
      if (params && params.role) {
        opt['role'] = { $regex: params.role, $options: 'i' };
      }

      const users = await this.userModel.find(opt).select('-__v').lean().exec();

      const retUsers = users.map((u) => {
        const r: iUserResponse = {
          id: u._id,
          email: u.email,
          name: u.name,
          contactPhone: u.contactPhone ?? '',
          role: u.role,
        };
        return r;
      });
      return retUsers;
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException('Не удалось найти пользователей');
    }
  }

  async findById(id: ID): Promise<iUser | null> {
    try {
      const user = await this.userModel
        .findById(id)
        .select('-__v')
        .lean()
        .exec();
      return user;
    } catch (e) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<iUser | null> {
    try {
      const user = await this.userModel
        .findOne({ email: email })
        .select('-__v')
        .lean()
        .exec();
      return user;
    } catch (e) {
      console.log('error log', e);
      return null;
    }
  }

  async remove(id: ID): Promise<boolean> {
    try {
      const user = await this.userModel.findById(id);
      await user.deleteOne();
      return true;
    } catch (e) {
      console.log('error log', e);
      throw new BadRequestException('не удалось удалить пользователя');
    }
  }

  async update(id: ID, data: UpdateUserDto): Promise<iUserResponse> {
    try {
      const user = await this.userModel.findById(id).select('-__v');
      user.email = data.email ?? user.email;
      user.passwordHash = data.password ?? user.passwordHash;
      user.save();
      const retUser: iUserResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
      };
      return retUser;
    } catch (e) {
      throw new BadRequestException('не удалось обноваить данные пользователя');
    }
  }
}
