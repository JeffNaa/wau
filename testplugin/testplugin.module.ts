import { Module } from '@nestjs/common';
import { TestpluginController } from './testplugin.controller';
import { TestpluginService } from './testplugin.service';

@Module({
  controllers: [TestpluginController],
  providers: [TestpluginService]
})
export class TestpluginModule {}
