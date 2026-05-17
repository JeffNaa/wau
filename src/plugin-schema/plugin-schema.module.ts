import { Global, Module } from '@nestjs/common';
import { PluginSchemaService } from './plugin-schema.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PluginSchemaService,
    { provide: 'PluginSchemaService', useExisting: PluginSchemaService },
  ],
  exports: [PluginSchemaService, 'PluginSchemaService'],
})
export class PluginSchemaModule {}
