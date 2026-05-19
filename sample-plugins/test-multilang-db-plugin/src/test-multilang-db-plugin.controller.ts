import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query,
  Inject, NotFoundException,
} from '@nestjs/common';
import { TestMultilangDbPluginService } from './test-multilang-db-plugin.service';

@Controller()
export class TestMultilangDbPluginController {
  constructor(
    private readonly service: TestMultilangDbPluginService,
    @Inject('PluginSchemaService') private readonly schema: any,
    @Inject('PluginDataService') private readonly data: any,
    @Inject('I18N_SERVICE') private readonly i18n: any,
  ) {}

  private readonly pluginName = 'test-multilang-db-plugin';

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  // ========== KV Store: Multilingual Config ==========

  @Get('kv/config')
  async getSiteConfig(@Query('lang') lang?: string) {
    const row = await this.data.get(this.pluginName, 'config:site', {
      i18nPaths: ['siteName', 'welcomeMessage'],
      lang,
    });
    return row?.data ?? {};
  }

  @Post('kv/config')
  async setSiteConfig(@Body() body: any) {
    const row = await this.data.set(this.pluginName, 'config:site', body, {
      i18nPaths: ['siteName', 'welcomeMessage'],
    });
    return row.data;
  }

  @Get('kv/announcement')
  async getAnnouncement(@Query('lang') lang?: string) {
    const row = await this.data.get(this.pluginName, 'config:announcement', {
      i18nPaths: ['title', 'body'],
      lang,
    });
    return row?.data ?? {};
  }

  @Post('kv/announcement')
  async setAnnouncement(@Body() body: any) {
    const row = await this.data.set(this.pluginName, 'config:announcement', body, {
      i18nPaths: ['title', 'body'],
    });
    return row.data;
  }

  @Get('kv/all')
  async listAllKv(@Query('lang') lang?: string) {
    return this.data.list(this.pluginName, { resolveI18n: true, lang });
  }

  @Delete('kv/:key')
  async deleteKv(@Param('key') key: string) {
    await this.data.remove(this.pluginName, `config:${key}`);
    return { removed: true };
  }

  // ========== DataTable: Articles (with i18n fields) ==========

  @Get('articles')
  async listArticles(
    @Query('status') status?: string,
    @Query('author') author?: string,
    @Query('lang') lang?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (author) where.author = author;

    return this.schema.find(this.pluginName, 'articles', {
      where,
      orderBy: { field: 'created_at', direction: 'desc' },
      lang,
    });
  }

  @Post('articles')
  async createArticle(@Body() body: any) {
    return this.schema.create(this.pluginName, 'articles', body);
  }

  @Get('articles/:id')
  async getArticle(@Param('id') id: string, @Query('lang') lang?: string) {
    const article = await this.schema.findOne(
      this.pluginName,
      'articles',
      { id: parseInt(id, 10) },
      undefined,
      lang,
    );
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  @Put('articles/:id')
  async updateArticle(@Param('id') id: string, @Body() body: any) {
    const { id: _id, ...data } = body;
    const updated = await this.schema.update(
      this.pluginName,
      'articles',
      { id: parseInt(id, 10) },
      data,
    );
    if (updated.length === 0) throw new NotFoundException('Article not found');
    return updated[0];
  }

  @Delete('articles/:id')
  async deleteArticle(@Param('id') id: string) {
    const removed = await this.schema.remove(this.pluginName, 'articles', {
      id: parseInt(id, 10),
    });
    return { removed: removed > 0 };
  }

  // ========== DataTable: Categories (with i18n fields) ==========

  @Get('categories')
  async listCategories(@Query('lang') lang?: string) {
    return this.schema.find(
      this.pluginName,
      'categories',
      { orderBy: { field: 'sort_order', direction: 'asc' }, lang },
    );
  }

  @Post('categories')
  async createCategory(@Body() body: any) {
    return this.schema.create(this.pluginName, 'categories', body);
  }

  @Get('categories/:id')
  async getCategory(@Param('id') id: string, @Query('lang') lang?: string) {
    const category = await this.schema.findOne(
      this.pluginName,
      'categories',
      { id: parseInt(id, 10) },
      undefined,
      lang,
    );
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const { id: _id, ...data } = body;
    const updated = await this.schema.update(
      this.pluginName,
      'categories',
      { id: parseInt(id, 10) },
      data,
    );
    if (updated.length === 0) throw new NotFoundException('Category not found');
    return updated[0];
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    const removed = await this.schema.remove(this.pluginName, 'categories', {
      id: parseInt(id, 10),
    });
    return { removed: removed > 0 };
  }

  // ========== Translation Demo ==========

  @Get('translate/:key')
  translate(@Param('key') key: string) {
    return {
      key,
      message: this.i18n.tPlugin(this.pluginName, `messages.${key}`),
    };
  }
}
