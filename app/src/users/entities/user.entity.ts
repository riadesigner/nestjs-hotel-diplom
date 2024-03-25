import { ID, UserRole } from '../dto/abstract-user';

export class iUser {
  _id?: ID;
  email?: string;
  passwordHash?: string;
  name: string;
  contactPhone?: string;
  role?: UserRole;
}
