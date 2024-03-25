import { HttpException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { SignInUserDto } from '../users/dto/signIn-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(user: SignInUserDto) {
    console.log('user', user);
    const foundUser = await this.usersService.findByEmail(user.email);
    if (!foundUser) {
      throw new HttpException('Unknown user', 403);
    }
    if (!user || !(await compare(user.password, foundUser.passwordHash))) {
      throw new HttpException('Incorrect login or password', 403);
    }
    const { passwordHash, ...retUser } = foundUser;
    return retUser;
  }
}
