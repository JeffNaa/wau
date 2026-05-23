import {
  Controller, Get, Post,
  Body, Req, Inject, SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { TestAuthPluginService } from './test-auth-plugin.service';

/**
 * UserPayload shape (mirrored from core auth.types.ts)
 * Plugins cannot import core types directly, so we inline the interface.
 */
interface UserPayload {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
}

@Controller()
export class TestAuthPluginController {
  constructor(
    private readonly service: TestAuthPluginService,
    @Inject('AuthContextService') private readonly authContext: any,
  ) {}

  // ========== Scenario A: Authentication required ==========
  // manifest.json auth.required = true means routes need authentication.
  // manifest.permissions is purely a declaration — it does NOT enforce
  // anything automatically. Use @SetMetadata('permissions', [...]) to
  // actually restrict access.

  @Get('status')
  @SetMetadata('permissions', ['test-auth:access'])
  getStatus() {
    return this.service.getStatus();
  }

  // ========== Scenario B: Public route override ==========
  // Override manifest-level auth.required = true for specific routes

  @Get('health')
  @SetMetadata('isPublic', true)
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // ========== Scenario C: Get current user via req.user ==========

  @Get('me')
  @SetMetadata('permissions', ['test-auth:access'])
  getCurrentUser(@Req() req: Request) {
    const user = (req as any).user as UserPayload | undefined;
    if (!user) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };
  }

  // ========== Scenario D: Method-level permission enforcement ==========
  // Explicitly declare permissions per route. This is the only way
  // access control actually takes effect.

  @Post('admin-action')
  @SetMetadata('permissions', ['test-auth:admin'])
  adminAction(@Req() req: Request) {
    const user = (req as any).user as UserPayload | undefined;
    return {
      message: 'Admin action executed',
      executedBy: user?.email,
      timestamp: new Date().toISOString(),
    };
  }

  // ========== Scenario E: Programmatic auth checks via AuthContextService ==========

  @Get('check')
  @SetMetadata('permissions', ['test-auth:access'])
  checkPermissions(@Req() req: Request) {
    const user = this.authContext.getCurrentUser(req);
    const hasAccess = this.authContext.hasPermission(req, 'test-auth:access');
    const hasAdmin = this.authContext.hasPermission(req, 'test-auth:admin');
    const isAdminRole = this.authContext.hasRole(req, 'ADMIN');

    return {
      user: user
        ? { userId: user.userId, email: user.email, role: user.role }
        : null,
      checks: {
        hasAccess,
        hasAdmin,
        isAdminRole,
      },
    };
  }

  // ========== Scenario F: Read/write user profile extension ==========
  // Demonstrates how a plugin could store custom user fields in the
  // profile JSONB column (actual persistence would use PluginDataService
  // or a dedicated API — here we just echo the structure).

  @Get('profile')
  @SetMetadata('permissions', ['test-auth:access'])
  getUserProfile(@Req() req: Request) {
    const user = (req as any).user as UserPayload | undefined;
    if (!user) {
      return { authenticated: false };
    }
    // In a real implementation, fetch from User.profile JSONB via core API
    return {
      userId: user.userId,
      profile: {
        // Example: plugin-scoped fields under dot-notation namespace
        'testAuth.preferredLanguage': 'en',
        'testAuth.notificationEnabled': true,
      },
    };
  }

  @Post('profile')
  @SetMetadata('permissions', ['test-auth:access'])
  updateUserProfile(@Req() req: Request, @Body() body: { preferredLanguage?: string; notificationEnabled?: boolean }) {
    const user = (req as any).user as UserPayload | undefined;
    if (!user) {
      return { authenticated: false };
    }
    // In a real implementation, merge into User.profile JSONB via core API
    return {
      userId: user.userId,
      updated: {
        'testAuth.preferredLanguage': body.preferredLanguage,
        'testAuth.notificationEnabled': body.notificationEnabled,
      },
    };
  }
}
