import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { I18nService } from '../i18n/i18n.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(this.i18n.t('errors.auth.forbidden'));
    }

    const hasPermission = this.matchPermissions(user.permissions, requiredPermissions);
    if (!hasPermission) {
      throw new ForbiddenException(this.i18n.t('errors.auth.forbidden'));
    }

    return true;
  }

  private matchPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every((required) =>
      userPermissions.some((userPerm) => this.matchSingle(userPerm, required)),
    );
  }

  private matchSingle(userPerm: string, required: string): boolean {
    if (userPerm === '*') return true;

    if (userPerm.endsWith(':*')) {
      const prefix = userPerm.slice(0, -2);
      return required.startsWith(prefix + ':');
    }

    return userPerm === required;
  }
}
