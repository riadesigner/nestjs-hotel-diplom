import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class LoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (!context.switchToHttp().getRequest().isAuthenticated()) {
      throw new HttpException('только для авторизированных пользователей', 401);
    } else {
      return true;
    }
  }
}
