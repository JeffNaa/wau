import { Module } from '@nestjs/common';
import { TestHybridPluginController } from './test-hybrid-plugin.controller';
import { TestHybridPluginService } from './test-hybrid-plugin.service';

@Module({
  controllers: [TestHybridPluginController],
  providers: [TestHybridPluginService],
})
export class TestHybridPluginModule {}
