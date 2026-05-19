import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AsyncLocalStorage } from 'async_hooks';
import { DEFAULT_LOCALE } from './i18n.constant';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private readonly storage = new AsyncLocalStorage<string>();
  private readonly localesDir = path.join(process.cwd(), 'locales');
  private translations = new Map<string, Record<string, any>>();

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    if (!fs.existsSync(this.localesDir)) return;

    const entries = fs.readdirSync(this.localesDir);
    for (const entry of entries) {
      const entryPath = path.join(this.localesDir, entry);
      if (!fs.statSync(entryPath).isDirectory()) continue;

      const files = fs.readdirSync(entryPath).filter((f) => f.endsWith('.json'));
      const merged: Record<string, any> = {};
      for (const file of files) {
        const content = fs.readJsonSync(path.join(entryPath, file));
        Object.assign(merged, content);
      }
      this.translations.set(entry, merged);
    }
  }

  getStorage(): AsyncLocalStorage<string> {
    return this.storage;
  }

  getLocale(): string {
    return this.storage.getStore() ?? DEFAULT_LOCALE;
  }

  translate(key: string, args?: Record<string, any>): string {
    const locale = this.getLocale();
    let message = this.resolveKey(this.translations.get(locale), key);

    if (message === undefined) {
      message = this.resolveKey(this.translations.get(DEFAULT_LOCALE), key);
    }

    if (message === undefined) {
      this.logger.warn(`Missing translation key: ${key}`);
      return key;
    }

    if (args) {
      for (const [argKey, argValue] of Object.entries(args)) {
        message = message.replace(new RegExp(`\\{${argKey}\\}`, 'g'), String(argValue));
      }
    }

    return message;
  }

  private resolveKey(translations: Record<string, any> | undefined, key: string): string | undefined {
    if (!translations) return undefined;
    const parts = key.split('.');
    let current = translations;
    for (const part of parts) {
      if (current === null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return typeof current === 'string' ? current : undefined;
  }

  t(key: string, args?: Record<string, any>): string {
    return this.translate(key, args);
  }
}
