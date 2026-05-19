import { Module } from '@nestjs/common';
import { TestMultilangController } from './test-multilang.controller';
import { TestMultilangService } from './test-multilang.service';

@Module({
  controllers: [TestMultilangController],
  providers: [TestMultilangService],
})
export class TestMultilangModule {}
