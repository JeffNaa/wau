import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestPluginService {
  private readonly logger = new Logger(TestPluginService.name);

  getStatus() {
    return {
      status: 'Online',
      printer: 'Test-Plugin Printer'
    };
  }

  printOrder(orderId: string, items: any[]) {
    this.logger.log(`🖨️ [Test-Plugin] Processing Request: ${orderId}`);

    return {
      success: true,
      message: `Request ${orderId} has been successfully tested.`,
      timestamp: new Date().toISOString()
    };
  }
}
