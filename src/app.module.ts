// src/app.module.ts
import { Module } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { PluginController } from './plugin.controller';
import { PluginLoaderModule } from './plugins/plugin-loader.module';
import * as path from 'path';

// Load NestJS decorated plugins from the storage/plugins directory synchronously at boot time
const pluginsDir = path.join(process.cwd(), 'storage/plugins');

@Module({
  imports: [PluginLoaderModule.forRoot(pluginsDir)],
  controllers: [PluginController],
  providers: [PluginManagerService],
})
export class AppModule {}