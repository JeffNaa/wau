import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import * as path from 'path';

const pluginsDir = path.join(process.cwd(), 'storage/plugins');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule,
    PrismaModule,
    PluginRegistryModule,
    PluginDataModule,
    PluginMigrationModule,
    PluginSchemaModule,
    PluginLoaderModule.forRoot(pluginsDir),
  ],
  controllers: [PluginController],
  providers: [PluginManagerService, PostgresExceptionFilter],
})
export class AppModule {}