import { Controller, Post, Get, Put, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PluginManagerService } from './plugin-manager.service';
import { RequirePermissions } from './auth/permissions.decorator';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginManagerService) {}

  @RequirePermissions('plugin:create')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.pluginService.install(file);
  }

  @RequirePermissions('plugin:read')
  @Get()
  async getPlugins() {
    return this.pluginService.listPlugins();
  }

  @RequirePermissions('plugin:update')
  @Put()
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file: Express.Multer.File) {
    return this.pluginService.update(file);
  }

  @RequirePermissions('plugin:delete')
  @Delete(':name')
  async uninstall(@Param('name') name: string) {
    return this.pluginService.uninstall(name);
  }
}