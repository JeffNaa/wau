import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestKvPluginService {
  private readonly logger = new Logger(TestKvPluginService.name);

  getStatus() {
    return {
      status: 'Online',
      mode: 'KV',
      storage: 'plugin_data',
    };
  }
}
