// src/plugin.controller.ts
import { Controller, Post, Get, Put, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PluginManagerService } from './plugin-manager.service';

@Controller('plugins')
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

  // Update an existing plugin by name
  @Put(':name')
  @UseInterceptors(FileInterceptor('file'))
  async update(@Param('name') name: string, @UploadedFile() file: Express.Multer.File) {
    return this.pluginService.update(name, file);
  }

  // Uninstall a plugin by name
  @Delete(':name')
  async uninstall(@Param('name') name: string) {
    return this.pluginService.uninstall(name);
  }
}