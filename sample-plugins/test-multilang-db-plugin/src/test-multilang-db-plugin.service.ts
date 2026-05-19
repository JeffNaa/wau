import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestMultilangDbPluginService {
  private readonly logger = new Logger(TestMultilangDbPluginService.name);

  getStatus() {
    return {
      plugin: 'test-multilang-db-plugin',
      description: 'Demo for i18n database fields (KV store + dynamic tables)',
      features: [
        'KV store with multilingual config (PluginData)',
        'Dynamic tables with i18n fields (PluginSchema)',
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
