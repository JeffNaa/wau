import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { I18nService } from '../i18n/i18n.service';
import { WebService } from './web.service';
import { CreatePageDto, UpdatePageDto, CreateNavigationDto, UpdateNavigationDto, UpdateConfigDto, ReorderNavigationDto } from './dto';

@Controller('web')
export class WebController {
  constructor(
    private readonly webService: WebService,
    private readonly i18n: I18nService,
  ) {}

  // ─── Config ───

  @Public()
  @Get('config')
  getAllConfigs() {
    return this.webService.getAllConfigs();
  }

  @Public()
  @Get('config/:key')
  getConfig(@Param('key') key: string) {
    return this.webService.getConfig(key);
  }

  @RequirePermissions('web:config:update')
  @Put('config/:key')
  updateConfig(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    return this.webService.updateConfig(key, dto);
  }

  // ─── Pages ───

  @RequirePermissions('web:page:read')
  @Get('pages')
  getAllPages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));
    return this.webService.getAllPages(pageNum, limitNum, search);
  }

  @Public()
  @Get('pages/:slug')
  async getPageBySlug(@Param('slug') slug: string) {
    const page = await this.webService.getPageBySlug(slug);
    if (!page) throw new NotFoundException(this.i18n.t('errors.web.page_not_found', { slug }));
    return page;
  }

  @RequirePermissions('web:page:create')
  @Post('pages')
  createPage(@Body() dto: CreatePageDto) {
    return this.webService.createPage(dto);
  }

  @RequirePermissions('web:page:update')
  @Put('pages/:slug')
  updatePage(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
    return this.webService.updatePage(slug, dto);
  }

  @RequirePermissions('web:page:delete')
  @Delete('pages/:slug')
  deletePage(@Param('slug') slug: string) {
    return this.webService.deletePage(slug);
  }

  @RequirePermissions('web:page:update')
  @Put('pages/:slug/home')
  setHomePage(@Param('slug') slug: string) {
    return this.webService.setHomePage(slug);
  }

  @Public()
  @Get('pages/home/default')
  getHomePage() {
    return this.webService.getHomePage();
  }

  // ─── Navigation ───

  @Public()
  @Get('navigation')
  getNavigation(@Query('position') position?: string) {
    return this.webService.getNavigation(position);
  }

  @RequirePermissions('web:navigation:create')
  @Post('navigation')
  createNavigation(@Body() dto: CreateNavigationDto) {
    return this.webService.createNavigation(dto);
  }

  @RequirePermissions('web:navigation:update')
  @Put('navigation/:id')
  updateNavigation(@Param('id') id: string, @Body() dto: UpdateNavigationDto) {
    return this.webService.updateNavigation(id, dto);
  }

  @RequirePermissions('web:navigation:delete')
  @Delete('navigation/:id')
  deleteNavigation(@Param('id') id: string) {
    return this.webService.deleteNavigation(id);
  }

  @RequirePermissions('web:navigation:update')
  @Put('navigation/reorder')
  reorderNavigation(@Body() dto: ReorderNavigationDto) {
    return this.webService.reorderNavigation(dto.orders);
  }

  // ─── Widgets ───

  @Public()
  @Get('widgets')
  getAllWidgets() {
    return this.webService.getAllWidgets();
  }

  @Public()
  @Get('widgets/:type')
  async getWidgetByType(@Param('type') type: string) {
    const widget = await this.webService.getWidgetByType(type);
    if (!widget) throw new NotFoundException(this.i18n.t('errors.web.widget_not_found', { type }));
    return widget;
  }
}
