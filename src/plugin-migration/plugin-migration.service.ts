import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PluginMigrationService {
  private readonly logger = new Logger(PluginMigrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Apply pending migrations for a plugin.
   * Returns the list of newly applied migration filenames.
   */
  async applyMigrations(
    pluginName: string,
    pluginPath: string,
    appliedMigrations: string[] = [],
  ): Promise<string[]> {
    const migrationsDir = path.join(pluginPath, 'migrations');

    if (!(await fs.pathExists(migrationsDir))) {
      throw new Error(
        `Migration mode plugin [${pluginName}] is missing migrations/ directory.`,
      );
    }

    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    const pending = sqlFiles.filter((f) => !appliedMigrations.includes(f));

    if (pending.length === 0) {
      this.logger.log(`No pending migrations for plugin [${pluginName}]`);
      return [];
    }

    for (const filename of pending) {
      const sqlPath = path.join(migrationsDir, filename);
      const sql = await fs.readFile(sqlPath, 'utf8');

      this.logger.log(
        `Applying migration [${filename}] for plugin [${pluginName}]...`,
      );
      await this.prisma.query(sql);
      this.logger.log(
        `Migration [${filename}] applied for plugin [${pluginName}]`,
      );
    }

    return pending;
  }

  private normalizePrefix(pluginName: string): string {
    // Replace hyphens with underscores to match common SQL naming conventions
    return `plugin_${pluginName.replace(/-/g, '_')}_`;
  }

  /**
   * Rollback all tables created by a migration-mode plugin.
   * Tables must follow the naming convention: plugin_{name}_*
   */
  async rollbackMigrations(pluginName: string): Promise<void> {
    const prefix = this.normalizePrefix(pluginName);

    const result = await this.prisma.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE $1`,
      [`${prefix}%`],
    );

    const tables = result.rows.map((r) => r.table_name);

    if (tables.length === 0) {
      this.logger.log(`No tables to drop for plugin [${pluginName}]`);
      return;
    }

    // Drop in reverse alphabetical order to reduce FK dependency issues
    tables.sort().reverse();

    for (const table of tables) {
      this.logger.log(`Dropping table [${table}] for plugin [${pluginName}]...`);
      await this.prisma.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }

    this.logger.log(`Rolled back ${tables.length} table(s) for plugin [${pluginName}]`);
  }

  /**
   * Read all migration filenames from a plugin's migrations directory.
   */
  async readMigrationFiles(pluginPath: string): Promise<string[]> {
    const migrationsDir = path.join(pluginPath, 'migrations');
    if (!(await fs.pathExists(migrationsDir))) return [];

    const files = await fs.readdir(migrationsDir);
    return files.filter((f) => f.endsWith('.sql')).sort((a, b) => a.localeCompare(b));
  }
}
