import { Controller, Get, Param, Query } from '@nestjs/common';
import { TestMultilangService } from './test-multilang.service';

@Controller()
export class TestMultilangController {
  constructor(private readonly service: TestMultilangService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('welcome')
  getWelcome() {
    return this.service.getWelcome();
  }

  @Get('hello/:name')
  getHello(@Param('name') name: string) {
    return this.service.getHello(name);
  }

  @Get('error-demo')
  getErrorDemo(@Query('key') key: string) {
    return this.service.getErrorDemo(key || 'default');
  }
}
