import { Module } from '@nestjs/common';
import { TestAuthPluginController } from './test-auth-plugin.controller';
import { TestAuthPluginService } from './test-auth-plugin.service';

@Module({
  controllers: [TestAuthPluginController],
  providers: [TestAuthPluginService],
})
export class TestAuthPluginModule {}
