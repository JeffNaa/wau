import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestHybridPluginService {
  private readonly logger = new Logger(TestHybridPluginService.name);

  getStatus() {
    return {
      status: 'Online',
      features: [
        'Product management via migration tables',
        'Order management via migration tables',
        'Shop config via KV store',
        'Order stats via KV store',
      ],
      tables: ['products', 'orders'],
      kvKeys: ['config:shop', 'config:categories', 'stats:order_count', 'stats:revenue'],
    };
  }
}
