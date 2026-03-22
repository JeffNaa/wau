import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestpluginService {
  private readonly logger = new Logger(TestpluginService.name);

  getStatus() {
    return {
      status: 'Online',
      printer: 'Testplugin Printer'
    };
  }

  printOrder(orderId: string, items: any[]) {
    this.logger.log(`🖨️ [Testplugin] Processing Request: ${orderId}`);
    
    return {
      success: true,
      message: `Request ${orderId} has been successfully tested.`,
      timestamp: new Date().toISOString()
    };
  }
}
