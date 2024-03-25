import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';

import { LoggedInGuard } from './logged-in.guard';

@Injectable()
export class ManagerGuard extends LoggedInGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const activated = super.canActivate(context);
    if (req.session.passport.user.role !== 'manager') {
      throw new HttpException('только для менеджеров', 403);
    } else {
      return activated;
    }
  }
}
