import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FieldDef, FieldType, PluginSchema, SchemaDef, WhereClause } from './plugin-schema.types';

@Injectable()
export class PluginSchemaService {
  private readonly logger = new Logger(PluginSchemaService.name);

  constructor(private readonly prisma: PrismaService) {}

  private normalizeName(name: string): string {
    return name.replace(/-/g, '_');
  }

  private getTableName(pluginName: string, modelName: string): string {
    return `plugin_${this.normalizeName(pluginName)}_${this.normalizeName(modelName)}`;
  }

  private mapTypeToSql(field: FieldDef): string {
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
      // JSON default values like '[]' or '{}'
      if (field.type === 'json') return `'${field.default}'`;
      return `'${field.default.replace(/'/g, "''")}'`;
    }
    return undefined;
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
          constraints.push(`CONSTRAINT "${tableName}_${fieldName}_uniq" UNIQUE ("${fieldName}")`);
        }
        if (field.index) {
          indexes.push(
            `CREATE INDEX IF NOT EXISTS "${tableName}_${fieldName}_idx" ON "${tableName}"("${fieldName}");`,
          );
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
  }

  /**
   * Build WHERE clause SQL and parameters.
   */
  private buildWhere(tableName: string, where?: WhereClause): { clause: string; params: any[] } {
    if (!where || Object.keys(where).length === 0) {
      return { clause: '', params: [] };
    }
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(where)) {
      if (value === null || value === undefined) {
        conditions.push(`"${key}" IS NULL`);
      } else if (Array.isArray(value)) {
        conditions.push(`"${key}" IN (${value.map(() => `$${idx++}`).join(', ')})`);
        params.push(...value);
      } else if (typeof value === 'object' && value !== null) {
        // Support operators: $gt, $gte, $lt, $lte, $ne, $like
        for (const [op, opVal] of Object.entries(value)) {
          switch (op) {
            case '$gt':
              conditions.push(`"${key}" > $${idx++}`);
              params.push(opVal);
              break;
            case '$gte':
              conditions.push(`"${key}" >= $${idx++}`);
              params.push(opVal);
              break;
            case '$lt':
              conditions.push(`"${key}" < $${idx++}`);
              params.push(opVal);
              break;
            case '$lte':
              conditions.push(`"${key}" <= $${idx++}`);
              params.push(opVal);
              break;
            case '$ne':
              conditions.push(`"${key}" <> $${idx++}`);
              params.push(opVal);
              break;
            case '$like':
              conditions.push(`"${key}" LIKE $${idx++}`);
              params.push(opVal);
              break;
          }
        }
      } else {
        conditions.push(`"${key}" = $${idx++}`);
        params.push(value);
      }
    }

    return { clause: `WHERE ${conditions.join(' AND ')}`, params };
  }

  // ========== CRUD Operations ==========

  private normalizeValues(values: any[]): any[] {
    return values.map((v) => {
      if (v === null || v === undefined) return v;
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });
  }

  async create(pluginName: string, modelName: string, data: Record<string, any>): Promise<any> {
    const tableName = this.getTableName(pluginName, modelName);
    const keys = Object.keys(data);
    const values = this.normalizeValues(Object.values(data));
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO "${tableName}" (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.prisma.query(sql, values);
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
    },
  ): Promise<any[]> {
    const tableName = this.getTableName(pluginName, modelName);
    const { clause, params } = this.buildWhere(tableName, options?.where);

    let sql = `SELECT * FROM "${tableName}" ${clause}`;

    if (options?.orderBy) {
      sql += ` ORDER BY "${options.orderBy.field}" ${options.orderBy.direction?.toUpperCase() ?? 'ASC'}`;
    }
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    const result = await this.prisma.query(sql, params);
    return result.rows;
  }

  async findOne(
    pluginName: string,
    modelName: string,
    where?: WhereClause,
  ): Promise<any | null> {
    const rows = await this.find(pluginName, modelName, { where, limit: 1 });
    return rows[0] ?? null;
  }

  async update(
    pluginName: string,
    modelName: string,
    where: WhereClause,
    data: Record<string, any>,
  ): Promise<any[]> {
    const tableName = this.getTableName(pluginName, modelName);
    const keys = Object.keys(data);
    const values = this.normalizeValues(Object.values(data));

    const setParts: string[] = keys.map((k, i) => `"${k}" = $${i + 1}`);

    // Auto-update updated_at unless explicitly provided
    if (!keys.includes('updated_at')) {
      setParts.push('"updated_at" = CURRENT_TIMESTAMP');
    }

    const setClause = setParts.join(', ');

    const { clause, params: whereParams } = this.buildWhere(tableName, where);
    const allParams = [...values, ...whereParams];
    const offset = values.length;
    const adjustedClause = clause
      ? clause.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + offset}`)
      : '';

    const sql = `UPDATE "${tableName}" SET ${setClause} ${adjustedClause} RETURNING *`;
    const result = await this.prisma.query(sql, allParams);
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
