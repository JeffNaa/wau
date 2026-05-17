import { Global, Module } from '@nestjs/common';
import { PluginDataService } from './plugin-data.service';

@Global()
@Module({
  providers: [
    PluginDataService,
    { provide: 'PluginDataService', useExisting: PluginDataService },
  ],
  exports: [PluginDataService, 'PluginDataService'],
})
export class PluginDataModule {}
