import { Body, Controller, Get, Post, Put, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { I18nService } from '../i18n/i18n.service';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';
import { UserPayload } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const token = this.extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException(this.i18n.t('errors.auth.unauthorized'));
    await this.authService.revokeToken(token);
    return { message: this.i18n.t('messages.auth.logout_success') };
  }

  @Post('logout-all')
  async logoutAll(@CurrentUser() user: UserPayload) {
    await this.authService.revokeAllTokens(user.userId);
    return { message: this.i18n.t('messages.auth.logout_all_success') };
  }

  @Get('me')
  async me(@CurrentUser() user: UserPayload) {
    return this.authService.getMe(user.userId);
  }

  @Put('password')
  async changePassword(@CurrentUser() user: UserPayload, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.userId, dto);
    return { message: this.i18n.t('messages.auth.password_changed') };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);
    // Return the same response regardless of whether email exists (prevent enumeration attacks)
    return { message: this.i18n.t('messages.auth.forgot_password_sent') };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: this.i18n.t('messages.auth.password_reset_success') };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
