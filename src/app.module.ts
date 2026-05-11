import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PluginManagerService } from './plugin-manager.service';
import { PluginController } from './plugin.controller';
import { PluginLoaderModule } from './plugins/plugin-loader.module';
import { PrismaModule } from './prisma/prisma.module';
import { PluginRegistryModule } from './plugin-registry/plugin-registry.module';
import { PluginDataModule } from './plugin-data/plugin-data.module';
import * as path from 'path';

const pluginsDir = path.join(process.cwd(), 'storage/plugins');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PluginRegistryModule,
    PluginDataModule,
    PluginLoaderModule.forRoot(pluginsDir),
  ],
  controllers: [PluginController],
  providers: [PluginManagerService],
})
export class AppModule {}