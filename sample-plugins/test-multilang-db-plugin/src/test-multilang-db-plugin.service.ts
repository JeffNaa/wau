import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestMultilangDbPluginService {
  private readonly logger = new Logger(TestMultilangDbPluginService.name);

  getStatus() {
    return {
      plugin: 'test-multilang-db-plugin',
      description: 'Demo for i18n database fields using SQL migrations (KV store + raw SQL tables)',
      features: [
        'KV store with multilingual config (PluginData)',
        'Tables created via migrations/*.sql (not manifest.schema)',
        'Schema cache registered manually in module onModuleInit',
        'Dynamic tables with i18n fields (PluginSchema CRUD still works)',
        'Auto-wrap on create',
        'Auto-merge on update',
        'Language fallback on read',
      ],
      tables: ['articles', 'categories'],
      kvKeys: ['config:site', 'config:announcement'],
      i18nFields: {
        articles: ['title', 'content'],
        categories: ['name', 'description'],
      },
    };
  }
}
