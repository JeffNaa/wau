// src/plugin-manager.service.ts
import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class PluginManagerService implements OnModuleInit {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  private readonly registry = new Map<string, any>();

  // Plugin Path: /storage/plugins
  private readonly pluginsDir = path.join(process.cwd(), 'storage/plugins');

  private readonly pluginRouter = require('express').Router();

  async onModuleInit() {
    // Ensure directory exists at startup
    await fs.ensureDir(this.pluginsDir);

    const server = this.adapterHost.httpAdapter.getInstance();
    // Mount the dynamic router BEFORE Nest's catch-all 404
    server.use('/api/plugins', this.pluginRouter);

    await this.loadAllPlugins();
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

      // Load routes immediately after install
      await this.loadPluginRoutes({ name, version });

      console.log(`📦 Wau Plugin [${name}] v${version} installed.`);

      return {
        success: true,
        plugin: name,
        version: version,
        path: targetPath,
      };
    } catch (error) {
      throw new BadRequestException(`Installation failed: ${error.message}`);
    }
  }

  // Get all installed plugins
  async listPlugins() {
    const dirs = await fs.readdir(this.pluginsDir);
    const plugins: any[] = [];
    
    for (const dir of dirs) {
      const manifestPath = path.join(this.pluginsDir, dir, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        const content = await fs.readJson(manifestPath);
        plugins.push(content);
      }
    }
    return plugins;
  }

  async loadPluginRoutes(pluginInfo: any) {
    const server = this.adapterHost.httpAdapter.getInstance();
    let pluginPath = path.join(this.pluginsDir, pluginInfo.name, 'dist/index.js');
    
    if (!fs.existsSync(pluginPath)) {
      pluginPath = path.join(this.pluginsDir, pluginInfo.name, 'index.js');
    }

    if (!fs.existsSync(pluginPath)) {
      console.warn(`[WauPluginManager] No index.js or dist/index.js found for plugin ${pluginInfo.name}`);
      return;
    }

    try {
      // 1. Dynamically import plugin JS
      // Clear cache to support hot reload (optional)
      delete require.cache[require.resolve(pluginPath)];
      const pluginModule = require(pluginPath);

      // Clean up existing routes for this plugin to prevent duplicates
      this.removePluginRoutes(pluginInfo.name);

      // 2. Register routes
      if (pluginModule.routes && Array.isArray(pluginModule.routes)) {
        pluginModule.routes.forEach(route => {
          // Add to the plugin Router rather than the main Express app
          const localPath = `/${pluginInfo.name}${route.path}`;
          this.pluginRouter[route.method.toLowerCase()](localPath, route.handler);
          
          console.log(`📡 Wau Route Registered: [${route.method}] /api/plugins${localPath}`);
        });
      }
    } catch (e) {
      console.error(`Failed to load routes for ${pluginInfo.name}:`, e.message);
    }
  }

  async loadAllPlugins() {
    const plugins = await this.listPlugins(); // Get installed plugin list

    for (const pluginInfo of plugins) {
      await this.loadPluginRoutes(pluginInfo);
    }
  }

  private removePluginRoutes(pluginName: string) {
    const prefix = `/${pluginName}`;
    if (this.pluginRouter && this.pluginRouter.stack) {
      this.pluginRouter.stack = this.pluginRouter.stack.filter((layer: any) => {
        if (layer.route && layer.route.path) {
          // Keep routes that don't match the plugin's prefix
          return !layer.route.path.startsWith(prefix);
        }
        return true;
      });
      console.log(`🧹 Wau Route Cleanup: Removed existing routes for [${pluginName}]`);
    }
  }

  private getPluginControllerRoutes(pluginPath: string): string[] {
    const routes: string[] = [];
    const pluginMainPath = path.join(pluginPath, 'dist', 'index.js');
    if (fs.existsSync(pluginMainPath)) {
      try {
        const exported = require(pluginMainPath);
        const PluginModule: any = Object.values(exported).find((val) => typeof val === 'function');
        if (PluginModule) {
          const controllers = Reflect.getMetadata('controllers', PluginModule) || [];
          for (const controller of controllers) {
            const rawPath = Reflect.getMetadata('path', controller);
            if (rawPath) {
              const paths = Array.isArray(rawPath) ? rawPath : [rawPath];
              for (const p of paths) {
                const normalizedPath = p.startsWith('/') ? p : `/${p}`;
                routes.push(normalizedPath);
              }
            }
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

    if (!(await fs.pathExists(targetPath))) {
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

    const installedManifest = await fs.readJson(path.join(targetPath, 'manifest.json'));
    const installedVersion = installedManifest.version;

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

    // Remove old routes, cache, and directory
    this.removePluginRoutes(name);
    this.registry.delete(name);
    this.clearRequireCache(targetPath);
    await fs.remove(targetPath);

    // Extract new version
    zip.extractAllTo(targetPath, true);

    // Check route conflicts
    const newRoutes = this.getPluginControllerRoutes(targetPath);
    const conflicts = newRoutes.filter((r) => existingRoutes.includes(r));
    if (conflicts.length > 0) {
      // Rollback: restore old version is not possible since we deleted it.
      // Just remove the broken extraction.
      await fs.remove(targetPath);
      throw new BadRequestException(
        `Update failed: Route conflict detected for controller paths: ${conflicts.join(', ')}`
      );
    }

    await this.loadPluginRoutes({ name, version: newVersion });

    console.log(`⬆️  Wau Plugin [${name}] updated from v${installedVersion} to v${newVersion}.`);

    return {
      success: true,
      plugin: name,
      previousVersion: installedVersion,
      version: newVersion,
      path: targetPath,
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

    if (!(await fs.pathExists(targetPath))) {
      throw new BadRequestException(`Plugin [${name}] is not installed.`);
    }

    // 1. Remove routes from the plugin router
    this.removePluginRoutes(name);

    // 2. Remove from registry
    this.registry.delete(name);

    // 3. Clear require cache for this plugin
    this.clearRequireCache(targetPath);

    // 4. Delete plugin directory
    await fs.remove(targetPath);

    console.log(`🗑️  Wau Plugin [${name}] uninstalled.`);

    return {
      success: true,
      plugin: name,
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