import { Module } from '@nestjs/common';
import { TestPluginController } from './test-plugin.controller';
import { TestPluginService } from './test-plugin.service';

@Module({
  controllers: [TestPluginController],
  providers: [TestPluginService]
})
export class TestPluginModule {}
