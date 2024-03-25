import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';

import { LoggedInGuard } from './logged-in.guard';

@Injectable()
export class AdminGuard extends LoggedInGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const activated = super.canActivate(context);
    if (req.session.passport.user.role !== 'admin') {
      throw new HttpException('только для администраторов', 403);
    } else {
      return activated;
    }
  }
}
