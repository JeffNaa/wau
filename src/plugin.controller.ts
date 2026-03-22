// src/plugin.controller.ts
import { Controller, Post, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PluginManagerService } from './plugin-manager.service';

@Controller('api/plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginManagerService) {}

  // Upload and install plugin
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.pluginService.install(file);
  }

  // Get plugin list
  @Get()
  async getPlugins() {
    return this.pluginService.listPlugins();
  }
}