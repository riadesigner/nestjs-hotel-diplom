import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { ID, iUserResponse } from './users/dto/abstract-user';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(private readonly usersService: UsersService) {}

  async getPublicMessage(): Promise<string> {
    return 'This message is public to all!';
  }

  async getPrivateMessage(): Promise<string> {
    return 'You can only see this if you are authenticated';
  }

  async getAdminMessage(): Promise<string> {
    return 'You can only see this if you are an admin';
  }

  async getManagerMessage(): Promise<string> {
    return 'You can only see this if you are an manager';
  }
  async getChatPage(userId: ID): Promise<iUserResponse> {
    try {
      const user = await this.usersService.findById(userId);
      const retUser: iUserResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
      };
      return retUser;
    } catch (e) {
      throw new BadRequestException(
        `не удалось найти пользователя с id: ${userId}`,
      );
    }
  }
}
