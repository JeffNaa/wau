import { Module } from '@nestjs/common';
import { TestMultilangDbPluginController } from './test-multilang-db-plugin.controller';
import { TestMultilangDbPluginService } from './test-multilang-db-plugin.service';

@Module({
  controllers: [TestMultilangDbPluginController],
  providers: [TestMultilangDbPluginService],
})
export class TestMultilangDbPluginModule {}
