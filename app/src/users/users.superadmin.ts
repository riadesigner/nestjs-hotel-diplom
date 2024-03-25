import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { iUser } from './entities/user.entity';
import { hash } from 'bcryptjs';

@Injectable()
export class Superadmin {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  /**
   *
   *    searching any admin in db, and if not found
   *    -> create the superadmin
   *
   */
  async init(): Promise<void> {
    const admins = await this.findAdmins();
    if (!admins || admins.length == 0) {
      const admin = await this.createSuperAdmin();
      console.log('superadmin just have been added to db', admin);
    } else {
      console.log('superadmin already in db');
    }
  }

  async findAdmins(): Promise<iUser[] | null> {
    return new Promise(async (res) => {
      try {
        const admins = await this.userModel
          .find({ role: 'admin' })
          .select('-__v');
        res(admins);
      } catch (e) {
        res(null);
      }
    });
  }

  async createSuperAdmin(): Promise<iUser | null> {
    return new Promise(async (res) => {
      try {
        const sAdmin = {
          email: process.env.APP_SUPERADMIN_EMAIL,
          passwordHash: await hash(process.env.APP_SUPERADMIN_PASSWORD, 12),
          name: 'Superadmin',
          role: 'admin',
        };
        const user = new this.userModel(sAdmin);
        user.save();
        res(user);
      } catch (e) {
        res(null);
      }
    });
  }
}
