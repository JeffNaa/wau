export type FieldType =
  | 'string'
  | 'int'
  | 'bigint'
  | 'float'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'timestamp'
  | 'json'
  | 'text';

export interface FieldDef {
  type: FieldType;
  required?: boolean;
  default?: any;
  unique?: boolean;
  index?: boolean;
  primary?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  values?: string[]; // for enum-like validation
}

export type SchemaDef = Record<string, FieldDef>;

export type PluginSchema = Record<string, SchemaDef>;

export type WhereClause = Record<string, any>;
