import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { TestMultilangDbPluginController } from './test-multilang-db-plugin.controller';
import { TestMultilangDbPluginService } from './test-multilang-db-plugin.service';

@Module({
  controllers: [TestMultilangDbPluginController],
  providers: [TestMultilangDbPluginService],
})
export class TestMultilangDbPluginModule implements OnModuleInit {
  constructor(
    @Inject('PluginSchemaService') private readonly schema: any,
  ) {}

  onModuleInit() {
    // Register schema cache manually so PluginSchemaService CRUD methods
    // can still resolve i18n fields (wrap/merge/flatten) correctly.
    // Tables are created via migrations/*.sql instead of syncSchema().
    this.schema.registerSchema('test-multilang-db-plugin', {
      articles: {
        title: { type: 'string', required: true, i18n: true },
        content: { type: 'text', i18n: true },
        slug: { type: 'string', required: true, unique: true, length: 100 },
        author: { type: 'string', required: true, length: 100 },
        status: { type: 'string', required: true, default: 'draft', index: true, length: 20 },
      },
      categories: {
        name: { type: 'string', required: true, i18n: true, unique: true, length: 100 },
        description: { type: 'text', i18n: true },
        sort_order: { type: 'int', default: 0 },
      },
    });
  }
}
