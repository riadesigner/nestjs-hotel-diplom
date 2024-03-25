import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole } from './abstract-user';

export class CreateUserDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @Length(3, 20)
  password: string;

  @IsDefined()
  @IsString()
  @Length(3, 20)
  confirmationPassword: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  contactPhone?: string;

  @IsOptional()
  role: UserRole;
}
