import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PluginManagerService } from './plugin-manager.service';
import { PluginController } from './plugin.controller';
import { PluginLoaderModule } from './plugins/plugin-loader.module';
import { PrismaModule } from './prisma/prisma.module';
import { PluginRegistryModule } from './plugin-registry/plugin-registry.module';
import { PluginDataModule } from './plugin-data/plugin-data.module';
import { PluginMigrationModule } from './plugin-migration/plugin-migration.module';
import { PluginSchemaModule } from './plugin-schema/plugin-schema.module';
import { I18nModule } from './i18n/i18n.module';
import { PostgresExceptionFilter } from './common/filters/postgres-exception.filter';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { PermissionGuard } from './auth/permission.guard';
import { WebModule } from './web/web.module';
import * as path from 'path';

const pluginsDir = path.join(process.cwd(), 'storage/plugins');
const webDistDir = path.join(process.cwd(), 'apps', 'web', 'dist');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: webDistDir,
      serveRoot: '/',
    }),
    AuthModule,
    I18nModule,
    PrismaModule,
    PluginRegistryModule,
    PluginDataModule,
    PluginMigrationModule,
    PluginSchemaModule,
    PluginLoaderModule.forRoot(pluginsDir),
    WebModule,
  ],
  controllers: [PluginController],
  providers: [
    PluginManagerService,
    PostgresExceptionFilter,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}