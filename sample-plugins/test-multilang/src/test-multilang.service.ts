import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class TestMultilangService {
  constructor(@Inject('I18N_SERVICE') private readonly i18n: any) {}

  getStatus() {
    return {
      plugin: 'test-multilang',
      message: this.i18n.tPlugin('test-multilang', 'messages.status_ok'),
    };
  }

  getWelcome() {
    return {
      message: this.i18n.tPlugin('test-multilang', 'messages.welcome'),
    };
  }

  getHello(name: string) {
    return {
      greeting: this.i18n.tPlugin('test-multilang', 'messages.hello', { name }),
    };
  }

  getErrorDemo(key: string) {
    return {
      error: this.i18n.tPlugin('test-multilang', 'errors.not_found', { key }),
    };
  }
}
