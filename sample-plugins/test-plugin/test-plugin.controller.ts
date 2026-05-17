import { Controller, Get, Post, Body } from '@nestjs/common';
import { TestPluginService } from './test-plugin.service';

@Controller()
export class TestPluginController {
  constructor(private readonly testPluginService: TestPluginService) {}

  @Get('status')

  getStatus() {
    return this.testPluginService.getStatus();
  }

  @Post('print')
  printOrder(@Body() body: { orderId: string, items: any[] }) {
    return this.testPluginService.printOrder(body.orderId, body.items);
  }
}
