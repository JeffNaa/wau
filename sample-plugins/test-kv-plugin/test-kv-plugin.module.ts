import { Module } from '@nestjs/common';
import { TestKvPluginController } from './test-kv-plugin.controller';
import { TestKvPluginService } from './test-kv-plugin.service';

@Module({
  controllers: [TestKvPluginController],
  providers: [TestKvPluginService],
})
export class TestKvPluginModule {}
