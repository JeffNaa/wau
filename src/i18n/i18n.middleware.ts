import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from './i18n.service';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private readonly i18n: I18nService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const locale = this.parseLocale(req.headers['accept-language']);
    this.i18n.getStorage().run(locale, next);
  }

  private parseLocale(header: string | string[] | undefined): string {
    if (!header) return 'en';
    const raw = Array.isArray(header) ? header[0] : header;
    const primary = raw.split(',')[0].trim();
    return primary.split(';')[0].trim() || 'en';
  }
}
