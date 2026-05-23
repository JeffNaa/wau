import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { PermissionGuard } from './permission.guard';
import { AuthContextService } from './auth-context.service';

@Global()
@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    PermissionGuard,
    AuthContextService,
    { provide: 'AuthContextService', useExisting: AuthContextService },
  ],
  exports: [AuthService, PermissionGuard, AuthContextService, 'AuthContextService'],
})
export class AuthModule {}
