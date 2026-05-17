import { Module } from '@nestjs/common';
import { TestMigrationPluginController } from './test-migration-plugin.controller';
import { TestMigrationPluginService } from './test-migration-plugin.service';

@Module({
  controllers: [TestMigrationPluginController],
  providers: [TestMigrationPluginService],
})
export class TestMigrationPluginModule {}
