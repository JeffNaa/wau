import { Controller, Get, Post, Body } from '@nestjs/common';
import { TestpluginService } from './testplugin.service';

@Controller()
export class TestpluginController {
  constructor(private readonly testpluginService: TestpluginService) {}

  @Get('status')

  getStatus() {
    return this.testpluginService.getStatus();
  }

  @Post('print')
  printOrder(@Body() body: { orderId: string, items: any[] }) {
    return this.testpluginService.printOrder(body.orderId, body.items);
  }
}
