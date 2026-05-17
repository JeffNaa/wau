import { Controller, Get, Post, Delete, Body, Param, Inject, NotFoundException } from '@nestjs/common';
import { TestKvPluginService } from './test-kv-plugin.service';

@Controller()
export class TestKvPluginController {
  constructor(
    private readonly service: TestKvPluginService,
    @Inject('PluginDataService') private readonly data: any,
  ) {}

  private readonly pluginName = 'test-kv-plugin';

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  // ========== Settings Store (basic KV) ==========

  @Get('settings')
  async listSettings() {
    const rows = await this.data.list(this.pluginName);
    return rows.map((r: any) => ({ key: r.key, data: r.data, updated_at: r.updated_at }));
  }

  @Get('settings/:key')
  async getSetting(@Param('key') key: string) {
    const row = await this.data.get(this.pluginName, key);
    if (!row) throw new NotFoundException(`Key "${key}" not found`);
    return { key: row.key, data: row.data, updated_at: row.updated_at };
  }

  @Post('settings/:key')
  async setSetting(@Param('key') key: string, @Body() body: any) {
    const row = await this.data.set(this.pluginName, key, body);
    return { key: row.key, data: row.data, updated_at: row.updated_at };
  }

  @Delete('settings/:key')
  async deleteSetting(@Param('key') key: string) {
    await this.data.remove(this.pluginName, key);
    return { removed: true };
  }

  // ========== Counter demo (read-modify-write via KV) ==========

  @Get('counter/:name')
  async getCounter(@Param('name') name: string) {
    const row = await this.data.get(this.pluginName, `counter:${name}`);
    if (!row) return { name, value: 0 };
    return { name, value: row.data?.value ?? 0 };
  }

  @Post('counter/:name/increment')
  async incrementCounter(@Param('name') name: string) {
    const existing = await this.data.get(this.pluginName, `counter:${name}`);
    const value = (existing?.data?.value ?? 0) + 1;
    const row = await this.data.set(this.pluginName, `counter:${name}`, { value });
    return { name, value: row.data.value };
  }

  @Post('counter/:name/decrement')
  async decrementCounter(@Param('name') name: string) {
    const existing = await this.data.get(this.pluginName, `counter:${name}`);
    const value = (existing?.data?.value ?? 0) - 1;
    const row = await this.data.set(this.pluginName, `counter:${name}`, { value });
    return { name, value: row.data.value };
  }

  @Delete('counter/:name')
  async resetCounter(@Param('name') name: string) {
    await this.data.remove(this.pluginName, `counter:${name}`);
    return { name, value: 0 };
  }
}
