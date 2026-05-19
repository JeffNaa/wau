import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { DEFAULT_LOCALE } from '../i18n/i18n.constant';

@Injectable()
export class PluginDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Resolve a JSONB i18n value to a single locale string.
   */
  resolveI18nValue(jsonb: any, locale: string = this.i18n.getLocale()): any {
    if (jsonb === null || jsonb === undefined) return undefined;
    if (typeof jsonb !== 'object' || Array.isArray(jsonb)) return jsonb;

    const val = jsonb[locale];
    if (val !== undefined && val !== null) return val;

    const fallback = jsonb[DEFAULT_LOCALE];
    if (fallback !== undefined && fallback !== null) return fallback;

    const firstKey = Object.keys(jsonb).find((k) => jsonb[k] !== undefined && jsonb[k] !== null);
    if (firstKey !== undefined) return jsonb[firstKey];

    return undefined;
  }

  /**
   * Wrap a value for an i18n field: string becomes {locale: value}, object stored as-is.
   */
  private wrapI18nValue(value: any, locale: string): any {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      return { [locale]: value };
    }
    return value;
  }

  /**
   * Recursively flatten i18n fields in a data object.
   * An object is treated as i18n if all its keys look like locale identifiers.
   */
  private flattenI18nData(data: any, locale: string): any {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map((item) => this.flattenI18nData(item, locale));

    const localePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    const keys = Object.keys(data);
    const isI18nMap = keys.length > 0 && keys.every((k) => localePattern.test(k));

    if (isI18nMap) {
      return this.resolveI18nValue(data, locale);
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = this.flattenI18nData(value, locale);
    }
    return result;
  }

  /**
   * Merge new i18n value with existing. String wraps to locale object; object merges key-by-key.
   */
  private mergeI18nValue(oldValue: any, newValue: any, locale: string): any {
    const wrapped = this.wrapI18nValue(newValue, locale);
    if (typeof wrapped === 'object' && wrapped !== null && !Array.isArray(wrapped)) {
      return { ...(oldValue ?? {}), ...wrapped };
    }
    return wrapped;
  }

  /**
   * Walk data and apply merge for i18nPaths. Mutates in place.
   */
  private mergeI18nPaths(data: Record<string, any>, existing: Record<string, any>, i18nPaths: string[], locale: string): void {
    for (const path of i18nPaths) {
      const keys = path.split('.');
      const lastKey = keys[keys.length - 1];
      const parentKeys = keys.slice(0, -1);

      // Find parent in new data
      let newParent = data;
      for (const k of parentKeys) {
        if (newParent[k] === undefined || newParent[k] === null) break;
        newParent = newParent[k];
      }
      if (!newParent || typeof newParent !== 'object') continue;
      if (!(lastKey in newParent)) continue;

      // Find parent in existing data
      let oldParent = existing;
      for (const k of parentKeys) {
        if (oldParent[k] === undefined || oldParent[k] === null) {
          oldParent = {};
          break;
        }
        oldParent = oldParent[k];
      }
      if (!oldParent || typeof oldParent !== 'object') oldParent = {};

      newParent[lastKey] = this.mergeI18nValue(oldParent[lastKey], newParent[lastKey], locale);
    }
  }

  /**
   * Walk data and wrap string values for i18nPaths (create mode: no merge, just wrap).
   */
  private wrapI18nPaths(data: Record<string, any>, i18nPaths: string[], locale: string): void {
    for (const path of i18nPaths) {
      const keys = path.split('.');
      const lastKey = keys[keys.length - 1];
      const parentKeys = keys.slice(0, -1);

      let parent = data;
      for (const k of parentKeys) {
        if (parent[k] === undefined || parent[k] === null) break;
        parent = parent[k];
      }
      if (!parent || typeof parent !== 'object') continue;
      if (!(lastKey in parent)) continue;

      parent[lastKey] = this.wrapI18nValue(parent[lastKey], locale);
    }
  }

  async get(plugin: string, key: string, options?: { resolveI18n?: boolean; lang?: string; i18nPaths?: string[] }) {
    const result = await this.prisma.client.pluginData.findUnique({
      where: { plugin_key: { plugin, key } },
    });

    if (!result) return result;

    const locale = options?.lang ?? this.i18n.getLocale();

    // Flatten specific paths if provided
    if (options?.i18nPaths && options.i18nPaths.length > 0) {
      const data = JSON.parse(JSON.stringify(result.data)); // clone
      for (const path of options.i18nPaths) {
        const keys = path.split('.');
        const lastKey = keys[keys.length - 1];
        const parentKeys = keys.slice(0, -1);

        let parent = data;
        for (const k of parentKeys) {
          if (parent[k] === undefined || parent[k] === null) break;
          parent = parent[k];
        }
        if (parent && typeof parent === 'object' && lastKey in parent) {
          parent[lastKey] = this.resolveI18nValue(parent[lastKey], locale);
        }
      }
      return { ...result, data };
    }

    // Heuristic auto-flatten if resolveI18n is true
    if (options?.resolveI18n) {
      return { ...result, data: this.flattenI18nData(result.data, locale) };
    }

    return result;
  }

  async set(plugin: string, key: string, data: any, options?: { i18nPaths?: string[] }) {
    const locale = this.i18n.getLocale();

    if (options?.i18nPaths && options.i18nPaths.length > 0) {
      const existing = await this.prisma.client.pluginData.findUnique({
        where: { plugin_key: { plugin, key } },
      });

      if (existing) {
        // Merge mode: update only passed languages for i18n paths
        const mergedData = JSON.parse(JSON.stringify(existing.data)); // clone
        this.deepMerge(mergedData, data);
        this.mergeI18nPaths(mergedData, (existing.data ?? {}) as Record<string, any>, options.i18nPaths, locale);

        return this.prisma.client.pluginData.upsert({
          where: { plugin_key: { plugin, key } },
          update: { data: mergedData },
          create: { plugin, key, data: mergedData },
        });
      } else {
        // No existing: wrap i18n paths
        const wrappedData = JSON.parse(JSON.stringify(data));
        this.wrapI18nPaths(wrappedData, options.i18nPaths, locale);

        return this.prisma.client.pluginData.upsert({
          where: { plugin_key: { plugin, key } },
          update: { data: wrappedData },
          create: { plugin, key, data: wrappedData },
        });
      }
    }

    // No i18nPaths: store as-is (backward compatible)
    return this.prisma.client.pluginData.upsert({
      where: { plugin_key: { plugin, key } },
      update: { data },
      create: { plugin, key, data },
    });
  }

  /**
   * Deep merge target with source (mutates target).
   */
  private deepMerge(target: any, source: any): void {
    if (source === null || source === undefined) return;
    if (typeof source !== 'object' || Array.isArray(source)) {
      return; // don't merge primitives/arrays at top level
    }
    for (const [key, value] of Object.entries(source)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) &&
          target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        this.deepMerge(target[key], value);
      } else {
        target[key] = value;
      }
    }
  }

  async remove(plugin: string, key: string) {
    return this.prisma.client.pluginData.delete({
      where: { plugin_key: { plugin, key } },
    });
  }

  async list(plugin: string, options?: { resolveI18n?: boolean; lang?: string; i18nPaths?: string[] }) {
    const results = await this.prisma.client.pluginData.findMany({ where: { plugin } });

    if (!options?.resolveI18n && !options?.i18nPaths) {
      return results;
    }

    const locale = options.lang ?? this.i18n.getLocale();
    return results.map((r) => {
      if (options?.i18nPaths && options.i18nPaths.length > 0) {
        const data = JSON.parse(JSON.stringify(r.data));
        for (const path of options.i18nPaths) {
          const keys = path.split('.');
          const lastKey = keys[keys.length - 1];
          const parentKeys = keys.slice(0, -1);

          let parent = data;
          for (const k of parentKeys) {
            if (parent[k] === undefined || parent[k] === null) break;
            parent = parent[k];
          }
          if (parent && typeof parent === 'object' && lastKey in parent) {
            parent[lastKey] = this.resolveI18nValue(parent[lastKey], locale);
          }
        }
        return { ...r, data };
      }

      return { ...r, data: this.flattenI18nData(r.data, locale) };
    });
  }

  // For migration-mode plugins to query their own tables
  async queryRaw<T>(query: string, params?: any[]) {
    return this.prisma.client.$queryRawUnsafe<T>(query, ...(params || []));
  }

  // For migration-mode plugins to execute writes on their own tables
  async executeRaw(query: string, params?: any[]) {
    return this.prisma.client.$executeRawUnsafe(query, ...(params || []));
  }
}
