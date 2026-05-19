import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { DEFAULT_LOCALE } from '../i18n/i18n.constant';
import { FieldDef, FieldType, PluginSchema, SchemaDef, WhereClause } from './plugin-schema.types';

@Injectable()
export class PluginSchemaService {
  private readonly logger = new Logger(PluginSchemaService.name);
  private readonly schemas = new Map<string, PluginSchema>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Cache a plugin's schema so subsequent CRUD calls can resolve i18n fields
   * without the caller having to pass it explicitly.
   */
  registerSchema(pluginName: string, schema: PluginSchema): void {
    this.schemas.set(pluginName, schema);
  }

  unregisterSchema(pluginName: string): void {
    this.schemas.delete(pluginName);
  }

  private normalizeName(name: string): string {
    return name.replace(/-/g, '_');
  }

  private getTableName(pluginName: string, modelName: string): string {
    return `plugin_${this.normalizeName(pluginName)}_${this.normalizeName(modelName)}`;
  }

  private mapTypeToSql(field: FieldDef): string {
    if (field.i18n) {
      return 'JSONB';
    }
    switch (field.type) {
      case 'string':
        return field.length ? `VARCHAR(${field.length})` : 'TEXT';
      case 'int':
        return 'INTEGER';
      case 'bigint':
        return 'BIGINT';
      case 'float':
        return 'REAL';
      case 'decimal':
        return `DECIMAL(${field.precision ?? 10},${field.scale ?? 2})`;
      case 'boolean':
        return 'BOOLEAN';
      case 'date':
        return 'DATE';
      case 'timestamp':
        return 'TIMESTAMP(3)';
      case 'json':
        return 'JSONB';
      case 'text':
        return 'TEXT';
      default:
        return 'TEXT';
    }
  }

  private formatDefault(field: FieldDef): string | undefined {
    if (field.default === undefined) return undefined;
    if (field.default === 'now()') return 'CURRENT_TIMESTAMP';
    if (typeof field.default === 'boolean') return field.default ? 'TRUE' : 'FALSE';
    if (typeof field.default === 'number') return String(field.default);
    if (typeof field.default === 'string') {
      if (field.type === 'json') return `'${field.default}'`;
      if (field.i18n) return `'{"${DEFAULT_LOCALE}":"${field.default.replace(/"/g, '\\"')}"}'`;
      return `'${field.default.replace(/'/g, "''")}'`;
    }
    return undefined;
  }

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
   * Flatten i18n fields in a row object to single locale values.
   */
  private flattenRow(row: Record<string, any>, i18nFields: Set<string>): Record<string, any> {
    const result = { ...row };
    const locale = this.i18n.getLocale();
    for (const field of i18nFields) {
      if (result[field] !== undefined) {
        result[field] = this.resolveI18nValue(result[field], locale);
      }
    }
    return result;
  }

  /**
   * Build CREATE TABLE SQL from schema definition.
   */
  private buildCreateTableSql(tableName: string, schema: SchemaDef): string {
    const columns: string[] = [];
    const constraints: string[] = [];
    const indexes: string[] = [];

    for (const [fieldName, field] of Object.entries(schema)) {
      const parts: string[] = [`"${fieldName}"`, this.mapTypeToSql(field)];

      if (field.primary) {
        parts.push('PRIMARY KEY');
      } else {
        if (field.required) {
          parts.push('NOT NULL');
        }
        const def = this.formatDefault(field);
        if (def !== undefined) {
          parts.push(`DEFAULT ${def}`);
        }
        if (field.unique) {
          if (field.i18n) {
            indexes.push(
              `CREATE UNIQUE INDEX IF NOT EXISTS "${tableName}_${fieldName}_uniq" ON "${tableName}" (("${fieldName}"->>'${DEFAULT_LOCALE}'));`,
            );
          } else {
            constraints.push(`CONSTRAINT "${tableName}_${fieldName}_uniq" UNIQUE ("${fieldName}")`);
          }
        }
        if (field.index) {
          if (field.i18n) {
            indexes.push(
              `CREATE INDEX IF NOT EXISTS "${tableName}_${fieldName}_idx" ON "${tableName}" USING GIN ("${fieldName}");`,
            );
          } else {
            indexes.push(
              `CREATE INDEX IF NOT EXISTS "${tableName}_${fieldName}_idx" ON "${tableName}"("${fieldName}");`,
            );
          }
        }
      }

      columns.push(parts.join(' '));
    }

    // Add id column if not defined
    if (!schema.id) {
      columns.unshift('"id" SERIAL PRIMARY KEY');
    }

    // Add automatic timestamp columns
    columns.push('"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP');
    columns.push('"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP');

    const createTable = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns.join(', ')}${constraints.length > 0 ? ', ' + constraints.join(', ') : ''});`;

    return [createTable, ...indexes].join('\n');
  }

  /**
   * Check if a table exists.
   */
  private async tableExists(tableName: string): Promise<boolean> {
    const result = await this.prisma.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [tableName],
    );
    return result.rows.length > 0;
  }

  /**
   * Get existing columns of a table.
   */
  private async getExistingColumns(tableName: string): Promise<string[]> {
    const result = await this.prisma.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [tableName],
    );
    return result.rows.map((r: any) => r.column_name);
  }

  /**
   * Sync schema for a plugin. Creates tables or adds new columns.
   */
  async syncSchema(pluginName: string, schema: PluginSchema): Promise<void> {
    this.registerSchema(pluginName, schema);
    for (const [modelName, modelSchema] of Object.entries(schema)) {
      const tableName = this.getTableName(pluginName, modelName);

      if (!(await this.tableExists(tableName))) {
        const sql = this.buildCreateTableSql(tableName, modelSchema);
        this.logger.log(`Creating table [${tableName}] for plugin [${pluginName}]...`);
        await this.prisma.query(sql);
        this.logger.log(`Table [${tableName}] created.`);
      } else {
        // Table exists: check for new columns
        const existingCols = await this.getExistingColumns(tableName);
        for (const [fieldName, fieldDef] of Object.entries(modelSchema)) {
          if (!existingCols.includes(fieldName)) {
            const colDef = `"${fieldName}" ${this.mapTypeToSql(fieldDef)}`;
            const nullable = fieldDef.required ? 'NOT NULL' : '';
            const def = this.formatDefault(fieldDef);
            const defaultClause = def !== undefined ? `DEFAULT ${def}` : '';
            const alterSql = `ALTER TABLE "${tableName}" ADD COLUMN ${colDef} ${nullable} ${defaultClause};`;

            this.logger.log(`Adding column [${fieldName}] to table [${tableName}]...`);
            await this.prisma.query(alterSql);
            this.logger.log(`Column [${fieldName}] added.`);

            // Add unique/index for new i18n columns if needed
            if (fieldDef.i18n) {
              if (fieldDef.unique) {
                await this.prisma.query(
                  `CREATE UNIQUE INDEX IF NOT EXISTS "${tableName}_${fieldName}_uniq" ON "${tableName}" (("${fieldName}"->>'${DEFAULT_LOCALE}'));`,
                );
              }
              if (fieldDef.index) {
                await this.prisma.query(
                  `CREATE INDEX IF NOT EXISTS "${tableName}_${fieldName}_idx" ON "${tableName}" USING GIN ("${fieldName}");`,
                );
              }
            }
          }
        }

        // Ensure timestamp columns exist on existing tables
        for (const tsCol of ['created_at', 'updated_at']) {
          if (!existingCols.includes(tsCol)) {
            const alterSql = `ALTER TABLE "${tableName}" ADD COLUMN "${tsCol}" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`;
            this.logger.log(`Adding column [${tsCol}] to table [${tableName}]...`);
            await this.prisma.query(alterSql);
            this.logger.log(`Column [${tsCol}] added.`);
          }
        }
      }
    }
  }

  /**
   * Drop all tables for a plugin's schema.
   */
  async dropSchema(pluginName: string, schema: PluginSchema): Promise<void> {
    const modelNames = Object.keys(schema);
    // Drop in reverse order to handle FK dependencies
    for (const modelName of modelNames.reverse()) {
      const tableName = this.getTableName(pluginName, modelName);
      this.logger.log(`Dropping table [${tableName}]...`);
      await this.prisma.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }
    this.unregisterSchema(pluginName);
  }

  private getI18nFields(schema: SchemaDef): Set<string> {
    const fields = new Set<string>();
    for (const [name, def] of Object.entries(schema)) {
      if (def.i18n) fields.add(name);
    }
    return fields;
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
   * Merge a new i18n value into the existing JSONB object, mirroring the KV
   * (PluginDataService) behavior: wrap strings to {locale: value}, then merge
   * with old. Returns the value to store.
   */
  private mergeI18nValue(oldValue: any, newValue: any, locale: string): any {
    const wrapped = this.wrapI18nValue(newValue, locale);
    if (wrapped !== null && typeof wrapped === 'object' && !Array.isArray(wrapped)) {
      const oldObj =
        oldValue !== null && typeof oldValue === 'object' && !Array.isArray(oldValue)
          ? oldValue
          : {};
      return { ...oldObj, ...wrapped };
    }
    return wrapped;
  }

  /**
   * Build WHERE clause SQL and parameters.
   */
  private buildWhere(
    tableName: string,
    where?: WhereClause,
    i18nFields?: Set<string>,
    locale?: string,
  ): { clause: string; params: any[] } {
    if (!where || Object.keys(where).length === 0) {
      return { clause: '', params: [] };
    }
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(where)) {
      const isI18n = i18nFields?.has(key);
      const columnRef = isI18n ? `"${key}"->>'${locale ?? DEFAULT_LOCALE}'` : `"${key}"`;

      if (value === null || value === undefined) {
        conditions.push(`${columnRef} IS NULL`);
      } else if (Array.isArray(value)) {
        conditions.push(`${columnRef} IN (${value.map(() => `$${idx++}`).join(', ')})`);
        params.push(...value);
      } else if (typeof value === 'object' && value !== null) {
        // Support operators: $gt, $gte, $lt, $lte, $ne, $like
        for (const [op, opVal] of Object.entries(value)) {
          switch (op) {
            case '$gt':
              conditions.push(`${columnRef} > $${idx++}`);
              params.push(opVal);
              break;
            case '$gte':
              conditions.push(`${columnRef} >= $${idx++}`);
              params.push(opVal);
              break;
            case '$lt':
              conditions.push(`${columnRef} < $${idx++}`);
              params.push(opVal);
              break;
            case '$lte':
              conditions.push(`${columnRef} <= $${idx++}`);
              params.push(opVal);
              break;
            case '$ne':
              conditions.push(`${columnRef} <> $${idx++}`);
              params.push(opVal);
              break;
            case '$like':
              conditions.push(`${columnRef} LIKE $${idx++}`);
              params.push(opVal);
              break;
          }
        }
      } else {
        conditions.push(`${columnRef} = $${idx++}`);
        params.push(value);
      }
    }

    return { clause: `WHERE ${conditions.join(' AND ')}`, params };
  }

  // ========== CRUD Operations ==========

  private normalizeValues(values: any[]): any[] {
    // Pass objects (including Date, JSONB) directly to pg — it handles serialization natively.
    // Do NOT pre-stringify: pg sends objects as JSONB with correct type OID.
    return values.map((v) => {
      if (v === null || v === undefined) return v;
      return v;
    });
  }

  private getModelSchema(pluginName: string, modelName: string, schema?: PluginSchema): SchemaDef | undefined {
    if (schema) return schema[modelName];
    const cached = this.schemas.get(pluginName);
    return cached ? cached[modelName] : undefined;
  }

  async create(
    pluginName: string,
    modelName: string,
    data: Record<string, any>,
    schema?: PluginSchema,
  ): Promise<any> {
    const tableName = this.getTableName(pluginName, modelName);
    const modelSchema = this.getModelSchema(pluginName, modelName, schema);
    const i18nFields = modelSchema ? this.getI18nFields(modelSchema) : new Set<string>();
    const locale = this.i18n.getLocale();

    const processedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      processedData[key] = i18nFields.has(key) ? this.wrapI18nValue(value, locale) : value;
    }

    const keys = Object.keys(processedData);
    const values = this.normalizeValues(Object.values(processedData));
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO "${tableName}" (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.prisma.query(sql, values);
    // Return the raw row (all locales in JSONB) to match KV (PluginDataService.set) behavior.
    return result.rows[0];
  }

  async find(
    pluginName: string,
    modelName: string,
    options?: {
      where?: WhereClause;
      orderBy?: { field: string; direction?: 'asc' | 'desc' };
      limit?: number;
      offset?: number;
      lang?: string;
    },
    schema?: PluginSchema,
  ): Promise<any[]> {
    const tableName = this.getTableName(pluginName, modelName);
    const modelSchema = this.getModelSchema(pluginName, modelName, schema);
    const i18nFields = modelSchema ? this.getI18nFields(modelSchema) : new Set<string>();
    const locale = options?.lang ?? this.i18n.getLocale();

    const { clause, params } = this.buildWhere(tableName, options?.where, i18nFields, locale);

    let sql = `SELECT * FROM "${tableName}" ${clause}`;

    if (options?.orderBy) {
      const isI18nOrder = i18nFields.has(options.orderBy.field);
      const orderCol = isI18nOrder
        ? `"${options.orderBy.field}"->>'${locale}'`
        : `"${options.orderBy.field}"`;
      sql += ` ORDER BY ${orderCol} ${options.orderBy.direction?.toUpperCase() ?? 'ASC'}`;
    }
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    const result = await this.prisma.query(sql, params);
    return modelSchema
      ? result.rows.map((row: any) => this.flattenRow(row, i18nFields))
      : result.rows;
  }

  async findOne(
    pluginName: string,
    modelName: string,
    where?: WhereClause,
    schema?: PluginSchema,
    lang?: string,
  ): Promise<any | null> {
    const rows = await this.find(pluginName, modelName, { where, limit: 1, lang }, schema);
    return rows[0] ?? null;
  }

  async update(
    pluginName: string,
    modelName: string,
    where: WhereClause,
    data: Record<string, any>,
    schema?: PluginSchema,
  ): Promise<any[]> {
    const tableName = this.getTableName(pluginName, modelName);
    const modelSchema = this.getModelSchema(pluginName, modelName, schema);
    const i18nFields = modelSchema ? this.getI18nFields(modelSchema) : new Set<string>();
    const locale = this.i18n.getLocale();

    // For i18n fields, merge with the EXISTING JSONB (not the flattened row that
    // `find` returns — spreading a string old value would yield {0:'F', 1:'i', ...}).
    const i18nKeysToMerge = Object.keys(data).filter((k) => i18nFields.has(k));
    if (i18nKeysToMerge.length > 0) {
      const { clause: rawClause, params: rawParams } = this.buildWhere(
        tableName,
        where,
        i18nFields,
        locale,
      );
      const rawResult = await this.prisma.query(
        `SELECT ${i18nKeysToMerge.map((k) => `"${k}"`).join(', ')} FROM "${tableName}" ${rawClause} LIMIT 1`,
        rawParams,
      );
      const existing = rawResult.rows[0];
      for (const key of i18nKeysToMerge) {
        const oldValue = existing ? existing[key] : undefined;
        data[key] = this.mergeI18nValue(oldValue, data[key], locale);
      }
    }

    const keys = Object.keys(data);
    const values = this.normalizeValues(Object.values(data));

    const setParts: string[] = keys.map((k, i) => `"${k}" = $${i + 1}`);

    // Auto-update updated_at unless explicitly provided
    if (!keys.includes('updated_at')) {
      setParts.push('"updated_at" = CURRENT_TIMESTAMP');
    }

    const setClause = setParts.join(', ');

    const { clause, params: whereParams } = this.buildWhere(tableName, where, i18nFields, locale);
    const allParams = [...values, ...whereParams];
    const offset = values.length;
    const adjustedClause = clause
      ? clause.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + offset}`)
      : '';

    const sql = `UPDATE "${tableName}" SET ${setClause} ${adjustedClause} RETURNING *`;
    const result = await this.prisma.query(sql, allParams);
    // Return raw rows (all locales in JSONB) to match KV behavior.
    return result.rows;
  }

  async remove(pluginName: string, modelName: string, where: WhereClause): Promise<number> {
    const tableName = this.getTableName(pluginName, modelName);
    const { clause, params } = this.buildWhere(tableName, where);

    const sql = `DELETE FROM "${tableName}" ${clause}`;
    const result = await this.prisma.query(sql, params);
    return result.rowCount ?? 0;
  }

  async count(pluginName: string, modelName: string, where?: WhereClause): Promise<number> {
    const tableName = this.getTableName(pluginName, modelName);
    const { clause, params } = this.buildWhere(tableName, where);

    const sql = `SELECT COUNT(*) as count FROM "${tableName}" ${clause}`;
    const result = await this.prisma.query(sql, params);
    return parseInt(result.rows[0].count, 10);
  }
}
