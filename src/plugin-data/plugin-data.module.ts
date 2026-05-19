import { Global, Module } from '@nestjs/common';
import { PluginDataService } from './plugin-data.service';
import { I18nModule } from '../i18n/i18n.module';

@Global()
@Module({
  imports: [I18nModule],
  providers: [
    PluginDataService,
    { provide: 'PluginDataService', useExisting: PluginDataService },
  ],
  exports: [PluginDataService, 'PluginDataService'],
})
export class PluginDataModule {}
