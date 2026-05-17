import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, NotFoundException } from '@nestjs/common';
import { TestMigrationPluginService } from './test-migration-plugin.service';

@Controller()
export class TestMigrationPluginController {
  constructor(
    private readonly service: TestMigrationPluginService,
    @Inject('PluginSchemaService') private readonly schema: any,
    @Inject('PluginDataService') private readonly data: any,
  ) {}

  private readonly pluginName = 'test-migration-plugin';

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  // ========== Authors ==========
  @Get('authors')
  async listAuthors() {
    return this.schema.find(this.pluginName, 'authors', {
      orderBy: { field: 'created_at', direction: 'desc' },
    });
  }

  @Post('authors')
  async createAuthor(@Body() body: any) {
    return this.schema.create(this.pluginName, 'authors', body);
  }

  @Get('authors/:id')
  async getAuthor(@Param('id') id: string) {
    return this.schema.findOne(this.pluginName, 'authors', { id: parseInt(id, 10) });
  }

  @Put('authors/:id')
  async updateAuthor(@Param('id') id: string, @Body() body: any) {
    const { id: _id, ...data } = body;
    return this.schema.update(this.pluginName, 'authors', { id: parseInt(id, 10) }, data);
  }

  @Delete('authors/:id')
  async deleteAuthor(@Param('id') id: string) {
    const removed = await this.schema.remove(this.pluginName, 'authors', { id: parseInt(id, 10) });
    return { removed };
  }

  // ========== Books ==========
  @Get('books')
  async listBooks(@Query('genre') genre?: string) {
    const where: any = {};
    if (genre) where.genre = genre;
    return this.schema.find(this.pluginName, 'books', {
      where,
      orderBy: { field: 'created_at', direction: 'desc' },
    });
  }

  @Post('books')
  async createBook(@Body() body: any) {
    return this.schema.create(this.pluginName, 'books', body);
  }

  @Get('books/:id')
  async getBook(@Param('id') id: string) {
    return this.schema.findOne(this.pluginName, 'books', { id: parseInt(id, 10) });
  }

  @Put('books/:id')
  async updateBook(@Param('id') id: string, @Body() body: any) {
    const { id: _id, ...data } = body;
    return this.schema.update(this.pluginName, 'books', { id: parseInt(id, 10) }, data);
  }

  @Delete('books/:id')
  async deleteBook(@Param('id') id: string) {
    const removed = await this.schema.remove(this.pluginName, 'books', { id: parseInt(id, 10) });
    return { removed };
  }

  // ========== Relationship: Author -> Books ==========
  @Get('authors/:id/books')
  async getAuthorBooks(@Param('id') id: string) {
    const author = await this.schema.findOne(this.pluginName, 'authors', { id: parseInt(id, 10) });
    if (!author) throw new NotFoundException('Author not found');

    const books = await this.schema.find(this.pluginName, 'books', {
      where: { author_id: parseInt(id, 10) },
    });

    return { author, books };
  }

  // ========== Relationship: SQL join sample ==========
  @Get('books-with-authors')
  async getBooksWithAuthors() {
    const result = await this.data.queryRaw(`
      SELECT
        b.id AS book_id,
        b.title,
        b.isbn,
        b.published_year,
        b.genre,
        a.id AS author_id,
        a.name AS author_name
      FROM plugin_test_migration_plugin_books b
      JOIN plugin_test_migration_plugin_authors a ON a.id = b.author_id
      ORDER BY b.created_at DESC
    `);
    return result;
  }
}
