import { Global, Module } from '@nestjs/common';
import { PluginSchemaService } from './plugin-schema.service';
import { PrismaModule } from '../prisma/prisma.module';
import { I18nModule } from '../i18n/i18n.module';

@Global()
@Module({
  imports: [PrismaModule, I18nModule],
  providers: [
    PluginSchemaService,
    { provide: 'PluginSchemaService', useExisting: PluginSchemaService },
  ],
  exports: [PluginSchemaService, 'PluginSchemaService'],
})
export class PluginSchemaModule {}
