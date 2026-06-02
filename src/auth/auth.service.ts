import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { UserPayload, TokenResponse } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  /** Clean up expired tokens globally on startup and sync default role permissions */
  async onModuleInit() {
    await this.cleanupExpiredTokens();
    await this.syncDefaultRolePermissions();
  }

  /** Ensure default roles have correct permissions */
  private async syncDefaultRolePermissions() {
    const defaultRoles = [
      { name: 'ADMIN', permissions: ['*'] },
      { name: 'USER', permissions: [] },
    ];

    for (const roleDef of defaultRoles) {
      const existing = await this.prisma.client.role.findUnique({
        where: { name: roleDef.name },
      });

      if (existing) {
        await this.prisma.client.role.update({
          where: { name: roleDef.name },
          data: { permissions: roleDef.permissions },
        });
      }
    }
  }

  /** Clean up expired tokens every 6 hours */
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupExpiredTokens() {
    const result = await this.prisma.client.userToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    if (result.count > 0) {
      console.log(this.i18n.t('messages.auth.tokens_cleaned', { count: result.count }));
    }
  }

  /** Clean up expired tokens for a specific user on login */
  async cleanupUserExpiredTokens(userId: string) {
    await this.prisma.client.userToken.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }

  /** Register a new user */
  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string; name: string | null }; token: TokenResponse }> {
    const userCount = await this.prisma.client.user.count();
    const isFirstUser = userCount === 0;

    const existing = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(this.i18n.t('errors.auth.email_already_registered'));
    }

    // Get or create the default role
    let role = await this.prisma.client.role.findUnique({
      where: { name: isFirstUser ? 'ADMIN' : 'USER' },
    });

    if (!role) {
      role = await this.prisma.client.role.create({
        data: { name: isFirstUser ? 'ADMIN' : 'USER', permissions: isFirstUser ? ['*'] : [] },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, parseInt(this.config.get('BCRYPT_ROUNDS', '12'), 10));

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name || null,
        roleId: role.id,
        status: 'ACTIVE',
      },
    });

    const token = await this.createToken(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  /** Login */
  async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<{ user: { id: string; email: string; name: string | null }; token: TokenResponse }> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException(this.i18n.t('errors.validation.required_fields'));
    }

    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('errors.auth.invalid_credentials'));
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException(this.i18n.t('errors.auth.invalid_credentials'));
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(this.i18n.t('errors.auth.account_not_active'));
    }

    // Clean up expired tokens for this user on login
    await this.cleanupUserExpiredTokens(user.id);

    // Update last login time
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.createToken(user.id, ip, userAgent);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  /** Create a token */
  private async createToken(userId: string, ip?: string, userAgent?: string): Promise<TokenResponse> {
    const token = crypto.randomBytes(32).toString('hex');
    const ttl = this.config.get<string>('TOKEN_TTL', '7d');
    const expiresAt = this.parseTtl(ttl);

    await this.prisma.client.userToken.create({
      data: {
        token,
        userId,
        expiresAt,
        ip: ip || null,
        userAgent: userAgent || null,
      },
    });

    return { token, expiresAt };
  }

  /** Validate a token */
  async validateToken(token: string): Promise<UserPayload | null> {
    const record = await this.prisma.client.userToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      return null;
    }

    return {
      userId: record.user.id,
      email: record.user.email,
      name: record.user.name,
      role: record.user.role.name,
      permissions: (record.user.role.permissions as string[]) || [],
    };
  }

  /** Revoke the current token */
  async revokeToken(token: string): Promise<void> {
    await this.prisma.client.userToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  /** Revoke all tokens for a user */
  async revokeAllTokens(userId: string): Promise<void> {
    await this.prisma.client.userToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Get current user details */
  async getMe(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: { role: true },
      omit: { password: true },
    });

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('errors.auth.user_not_found'));
    }

    return {
      ...user,
      permissions: (user.role.permissions as string[]) || [],
    };
  }

  /** Change password */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('errors.auth.user_not_found'));
    }

    const valid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!valid) {
      throw new BadRequestException(this.i18n.t('errors.auth.old_password_incorrect'));
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, parseInt(this.config.get('BCRYPT_ROUNDS', '12'), 10));

    await this.prisma.client.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all tokens after password change, force re-login
    await this.revokeAllTokens(userId);
  }

  /** Forgot password - generate reset token */
  async forgotPassword(email: string): Promise<{ resetToken: string } | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null; // Do not expose whether email exists
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store reset token in user profile (simplified approach)
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        profile: {
          ...(user.profile as Record<string, unknown> || {}),
          _resetToken: resetToken,
          _resetTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
        },
      },
    });

    return { resetToken };
  }

  /** Reset password */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    // Find user holding this reset token
    const users = await this.prisma.client.user.findMany();
    const user = users.find(u => {
      const profile = u.profile as Record<string, unknown> | null;
      return profile?._resetToken === resetToken;
    });

    if (!user) {
      throw new BadRequestException(this.i18n.t('errors.auth.invalid_reset_token'));
    }

    const profile = user.profile as Record<string, unknown> | null;
    const expiresAt = profile?._resetTokenExpiresAt as string | undefined;
    if (!expiresAt || new Date(expiresAt) < new Date()) {
      throw new BadRequestException(this.i18n.t('errors.auth.invalid_reset_token'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(this.config.get('BCRYPT_ROUNDS', '12'), 10));

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        profile: {
          ...profile,
          _resetToken: null,
          _resetTokenExpiresAt: null,
        },
      },
    });

    // Revoke all tokens after password reset
    await this.revokeAllTokens(user.id);
  }

  /** Check if the system has any users (for bootstrap mode) */
  async hasUsers(): Promise<boolean> {
    const count = await this.prisma.client.user.count();
    return count > 0;
  }

  /** Parse TTL string to Date */
  private parseTtl(ttl: string): Date {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
