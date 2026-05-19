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
  private pluginTranslations = new Map<string, string[]>();

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

  /**
   * Register a plugin's locale files into the global translation dictionary.
   * Keys are prefixed with `{pluginName}.` to avoid collisions.
   * Returns the list of registered keys for later cleanup.
   */
  registerPluginLocale(pluginName: string, pluginLocalesDir: string): string[] {
    if (!fs.existsSync(pluginLocalesDir)) return [];

    const registeredKeys: string[] = [];
    const localeDirs = fs.readdirSync(pluginLocalesDir).filter((d) => {
      const dPath = path.join(pluginLocalesDir, d);
      return fs.statSync(dPath).isDirectory();
    });

    for (const locale of localeDirs) {
      const localePath = path.join(pluginLocalesDir, locale);
      const files = fs.readdirSync(localePath).filter((f) => f.endsWith('.json'));

      for (const file of files) {
        const content: Record<string, any> = fs.readJsonSync(path.join(localePath, file));
        const prefix = file.replace(/\.json$/i, '');
        this.mergeWithPrefix(pluginName, locale, content, prefix, registeredKeys);
      }
    }

    this.pluginTranslations.set(pluginName, registeredKeys);
    this.logger.log(`Registered ${registeredKeys.length} keys for plugin [${pluginName}]`);
    return registeredKeys;
  }

  private mergeWithPrefix(
    pluginName: string,
    locale: string,
    obj: Record<string, any>,
    prefix: string,
    keys: string[],
  ) {
    const target = this.translations.get(locale) ?? {};
    this.translations.set(locale, target);

    if (!target[pluginName]) {
      target[pluginName] = {};
    }
    const pluginTarget = target[pluginName];

    // Accept both flat (`{welcome: "..."}`) and pre-wrapped (`{messages: {welcome: "..."}}`)
    // file layouts: if the file's sole top-level key matches its filename prefix, unwrap it
    // so we don't end up with `plugin.messages.messages.welcome`.
    let content = obj;
    if (
      prefix &&
      obj[prefix] !== undefined &&
      obj[prefix] !== null &&
      typeof obj[prefix] === 'object' &&
      !Array.isArray(obj[prefix]) &&
      Object.keys(obj).length === 1
    ) {
      content = obj[prefix];
    }

    if (prefix) {
      if (!pluginTarget[prefix] || typeof pluginTarget[prefix] !== 'object' || Array.isArray(pluginTarget[prefix])) {
        pluginTarget[prefix] = {};
      }
    }
    const root = prefix ? pluginTarget[prefix] : pluginTarget;
    const keyPrefix = `${pluginName}${prefix ? `.${prefix}` : ''}`;

    this.deepMergeAndCollect(content, root, keyPrefix, keys);
  }

  private deepMergeAndCollect(
    source: Record<string, any>,
    target: Record<string, any>,
    keyPrefix: string,
    keys: string[],
  ) {
    for (const [k, v] of Object.entries(source)) {
      const fullKey = `${keyPrefix}.${k}`;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        if (!target[k] || typeof target[k] !== 'object' || Array.isArray(target[k])) {
          target[k] = {};
        }
        this.deepMergeAndCollect(v, target[k], fullKey, keys);
      } else {
        target[k] = v;
        if (!keys.includes(fullKey)) {
          keys.push(fullKey);
        }
      }
    }
  }

  /**
   * Unregister all translations for a plugin.
   */
  unregisterPluginLocale(pluginName: string) {
    const keys = this.pluginTranslations.get(pluginName);
    if (!keys || keys.length === 0) {
      this.logger.warn(`No registered keys found for plugin [${pluginName}]`);
      return;
    }

    for (const localeTranslations of this.translations.values()) {
      for (const key of keys) {
        const parts = key.split('.');
        let current = localeTranslations;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current || typeof current !== 'object') break;
          current = current[parts[i]];
        }
        if (current && typeof current === 'object') {
          delete current[parts[parts.length - 1]];
        }
      }
    }

    this.pluginTranslations.delete(pluginName);
    this.logger.log(`Unregistered ${keys.length} keys for plugin [${pluginName}]`);
  }

  /**
   * Translate a key scoped to a plugin namespace.
   */
  tPlugin(pluginName: string, key: string, args?: Record<string, any>): string {
    return this.translate(`${pluginName}.${key}`, args);
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
