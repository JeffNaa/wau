import { Global, Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { I18nMiddleware } from './i18n.middleware';

export const I18N_SERVICE_TOKEN = 'I18N_SERVICE';

@Global()
@Module({
  providers: [
    I18nService,
    { provide: I18N_SERVICE_TOKEN, useExisting: I18nService },
  ],
  exports: [I18nService, I18N_SERVICE_TOKEN],
})
export class I18nModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(I18nMiddleware).forRoutes('*');
  }
}
