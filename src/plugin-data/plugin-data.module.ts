import { Module } from '@nestjs/common';
import { PluginDataService } from './plugin-data.service';

@Module({
  providers: [PluginDataService],
  exports: [PluginDataService],
})
export class PluginDataModule {}
