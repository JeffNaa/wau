// src/plugin-manager.service.ts
import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PluginRegistryService } from './plugin-registry/plugin-registry.service';
import { restart } from './bootstrap';

@Injectable()
export class PluginManagerService implements OnModuleInit {
  constructor(
    private readonly pluginRegistry: PluginRegistryService,
  ) {}

  private readonly registry = new Map<string, any>();

  // Plugin Path: /storage/plugins
  private readonly pluginsDir = path.join(process.cwd(), 'storage/plugins');

  async onModuleInit() {
    // Ensure directory exists at startup
    await fs.ensureDir(this.pluginsDir);
    console.log('🚀 Wau Core: Plugin directory initialized at', this.pluginsDir);
  }

  async install(file: Express.Multer.File) {
    try {
      const zip = new AdmZip(file.buffer);
      const zipEntries = zip.getEntries();

      // 1. Find manifest.json
      const manifestEntry = zipEntries.find(e => e.entryName === 'manifest.json');
      console.log(zipEntries[0].entryName);

      if (!manifestEntry) {
        throw new BadRequestException('Invalid Wau Plugin: manifest.json is missing.');
      }

      // 2. Parse configuration
      const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
      const { name, version } = manifest;

      if (!name) throw new BadRequestException('Plugin name is required in manifest.');
      if (!version) throw new BadRequestException('Plugin version is required in manifest.');

      // 3. Determine installation path
      const targetPath = path.join(this.pluginsDir, name);

      // Check DB first, then filesystem for backward compatibility
      const dbPlugin = await this.pluginRegistry.findOne(name);
      if (dbPlugin) {
        const cmp = this.compareVersions(version, dbPlugin.version);
        if (cmp === 0) {
          throw new BadRequestException(`Plugin [${name}] v${version} is already installed.`);
        }
        if (cmp < 0) {
          throw new BadRequestException(
            `Plugin [${name}] v${dbPlugin.version} is installed. Cannot downgrade to v${version}.`
          );
        }
        // Higher version: perform update
        return this.update(name, file);
      }

      if (await fs.pathExists(targetPath)) {
        const installedManifest = await fs.readJson(path.join(targetPath, 'manifest.json'));
        const installedVersion = installedManifest.version;
        const cmp = this.compareVersions(version, installedVersion);

        if (cmp === 0) {
          throw new BadRequestException(`Plugin [${name}] v${version} is already installed.`);
        }
        if (cmp < 0) {
          throw new BadRequestException(
            `Plugin [${name}] v${installedVersion} is installed. Cannot downgrade to v${version}.`
          );
        }
        // Higher version: perform update
        return this.update(name, file);
      }

      // Collect existing controller routes BEFORE extraction
      const existingRoutes = await this.getAllExistingPluginRoutes();

      // 4. Execute decompression (overwrite installation)
      zip.extractAllTo(targetPath, true);

      // Verify the new plugin's routes don't conflict with existing ones
      const newRoutes = this.getPluginControllerRoutes(targetPath);
      const conflicts = newRoutes.filter(r => existingRoutes.includes(r));
      if (conflicts.length > 0) {
        // Rollback extraction
        await fs.remove(targetPath);
        throw new BadRequestException(`Installation failed: Route conflict detected for controller paths: ${conflicts.join(', ')}`);
      }

      // Persist to database
      await this.pluginRegistry.create({ name, version, manifest });

      console.log(`📦 Wau Plugin [${name}] v${version} installed. Restarting server...`);

      // Restart to load new plugin routes via PluginLoaderModule
      // Fire-and-forget: return response immediately, restart in background
      restart().catch((err) => console.error('Restart failed:', err));

      return {
        success: true,
        plugin: name,
        version: version,
        path: targetPath,
        message: 'Server will restart shortly to load the new plugin.',
      };
    } catch (error) {
      throw new BadRequestException(`Installation failed: ${error.message}`);
    }
  }

  // Get all installed plugins
  async listPlugins() {
    return this.pluginRegistry.findAll();
  }

  private getPluginControllerRoutes(pluginPath: string): string[] {
    const routes: string[] = [];
    const pluginMainPath = path.join(pluginPath, 'dist', 'index.js');
    const manifestPath = path.join(pluginPath, 'manifest.json');

    let manifestName = path.basename(pluginPath);
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifestName = manifest.name || manifestName;
    }

    if (fs.existsSync(pluginMainPath)) {
      try {
        const exported = require(pluginMainPath);
        const PluginModule: any = Object.values(exported).find((val) => typeof val === 'function');
        if (PluginModule) {
          const controllers = Reflect.getMetadata('controllers', PluginModule) || [];
          for (const controller of controllers) {
            const rawPath = Reflect.getMetadata('path', controller);
            const controllerPath = rawPath || '';
            const normalizedControllerPath = controllerPath.startsWith('/') ? controllerPath : `/${controllerPath}`;
            const fullPath = normalizedControllerPath
              ? `/${manifestName}${normalizedControllerPath}`
              : `/${manifestName}`;
            routes.push(fullPath);
          }
        }
      } catch (e) {
        console.error(`Error reading plugin routes from ${pluginPath}`, e.message);
      }
    }
    return routes;
  }

  private async getAllExistingPluginRoutes(): Promise<string[]> {
    const dirs = await fs.readdir(this.pluginsDir);
    const allRoutes: string[] = [];
    for (const dir of dirs) {
      const pluginPath = path.join(this.pluginsDir, dir);
      const stat = await fs.stat(pluginPath);
      if (stat.isDirectory()) {
        allRoutes.push(...this.getPluginControllerRoutes(pluginPath));
      }
    }
    return allRoutes;
  }

  async update(name: string, file: Express.Multer.File) {
    const targetPath = path.join(this.pluginsDir, name);

    const dbPlugin = await this.pluginRegistry.findOne(name);
    if (!dbPlugin && !(await fs.pathExists(targetPath))) {
      throw new BadRequestException(
        `Plugin [${name}] is not installed. Use POST /api/plugins/upload to install it first.`
      );
    }

    const zip = new AdmZip(file.buffer);
    const manifestEntry = zip.getEntries().find((e) => e.entryName === 'manifest.json');
    if (!manifestEntry) {
      throw new BadRequestException('Invalid Wau Plugin: manifest.json is missing.');
    }

    const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
    const newVersion = manifest.version;
    if (!newVersion) {
      throw new BadRequestException('Plugin version is required in manifest.');
    }

    const installedVersion = dbPlugin?.version ?? (await fs.readJson(path.join(targetPath, 'manifest.json'))).version;

    const cmp = this.compareVersions(newVersion, installedVersion);
    if (cmp <= 0) {
      throw new BadRequestException(
        `Update rejected: uploaded version v${newVersion} must be greater than installed v${installedVersion}.`
      );
    }

    // Collect existing routes from OTHER plugins to check for conflicts
    const existingRoutes = (await this.getAllExistingPluginRoutes()).filter(
      (r) => !this.getPluginControllerRoutes(targetPath).includes(r)
    );

    // Remove old cache and directory
    this.registry.delete(name);
    this.clearRequireCache(targetPath);
    await fs.remove(targetPath);

    // Extract new version
    zip.extractAllTo(targetPath, true);

    // Check route conflicts
    const newRoutes = this.getPluginControllerRoutes(targetPath);
    const conflicts = newRoutes.filter((r) => existingRoutes.includes(r));
    if (conflicts.length > 0) {
      await fs.remove(targetPath);
      throw new BadRequestException(
        `Update failed: Route conflict detected for controller paths: ${conflicts.join(', ')}`
      );
    }

    // Persist to database
    await this.pluginRegistry.upsert(name, { version: newVersion, manifest });

    console.log(`⬆️  Wau Plugin [${name}] updated from v${installedVersion} to v${newVersion}. Restarting server...`);

    // Restart to reload plugin routes via PluginLoaderModule
    restart().catch((err) => console.error('Restart failed:', err));

    return {
      success: true,
      plugin: name,
      previousVersion: installedVersion,
      version: newVersion,
      path: targetPath,
      message: 'Server will restart shortly to apply the update.',
    };
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLen = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLen; i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  async uninstall(name: string) {
    const targetPath = path.join(this.pluginsDir, name);

    const dbPlugin = await this.pluginRegistry.findOne(name);
    if (!dbPlugin && !(await fs.pathExists(targetPath))) {
      throw new BadRequestException(`Plugin [${name}] is not installed.`);
    }

    // 1. Remove from registry
    this.registry.delete(name);

    // 2. Clear require cache for this plugin
    this.clearRequireCache(targetPath);

    // 3. Remove from database
    if (dbPlugin) {
      await this.pluginRegistry.remove(name);
    }

    // 4. Delete plugin directory
    await fs.remove(targetPath);

    console.log(`🗑️  Wau Plugin [${name}] uninstalled. Restarting server...`);

    // Restart to unload plugin routes via PluginLoaderModule
    restart().catch((err) => console.error('Restart failed:', err));

    return {
      success: true,
      plugin: name,
      message: 'Server will restart shortly to unload the plugin.',
    };
  }

  private clearRequireCache(pluginPath: string) {
    const keys = Object.keys(require.cache);
    for (const key of keys) {
      if (key.startsWith(pluginPath)) {
        delete require.cache[key];
      }
    }
  }

  async registerPluginMethods(name: string, module: any) {
    this.registry.set(name, module);
  }

  // For other plugins or controllers to call
  invoke(pluginName: string, methodName: string, ...args: any[]) {
    const plugin = this.registry.get(pluginName);
    if (plugin && typeof plugin[methodName] === 'function') {
      return plugin[methodName](...args);
    }
    throw new Error(`Method ${methodName} not found on plugin ${pluginName}`);
  }
}
