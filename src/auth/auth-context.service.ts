import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from './auth.types';

@Injectable()
export class AuthContextService {
  getCurrentUser(req: Request): UserPayload | undefined {
    return (req as any).user;
  }

  hasPermission(req: Request, permission: string): boolean {
    const user = this.getCurrentUser(req);
    if (!user) return false;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  }

  hasRole(req: Request, role: string): boolean {
    return this.getCurrentUser(req)?.role === role;
  }
}
