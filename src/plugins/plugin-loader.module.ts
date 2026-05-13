import { DynamicModule, Module, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';

@Module({})
export class PluginLoaderModule {
  static forRoot(pluginsDir: string): DynamicModule {
    const logger = new Logger('PluginLoaderModule');
    const imports: any[] = [];
    const registeredRoutes = new Set<string>();

    // Ensure the plugins directory exists
    fs.ensureDirSync(pluginsDir);

    const dirs = fs.readdirSync(pluginsDir);

    for (const dir of dirs) {
      const pluginDirPath = path.join(pluginsDir, dir);
      let pluginMainPath = path.join(pluginDirPath, 'dist', 'index.js');

      // Fallback to root-level index.js if dist/ is absent
      if (!fs.existsSync(pluginMainPath)) {
        pluginMainPath = path.join(pluginDirPath, 'index.js');
      }

      if (fs.existsSync(pluginMainPath)) {
        try {
          const exported = require(pluginMainPath);

          // Find the exported class (assuming it's a Nest Module)
          const PluginModule: any = Object.values(exported).find((val) => typeof val === 'function');

          if (PluginModule) {
            // Read manifest to get the plugin name for route prefix
            const manifestPath = path.join(pluginDirPath, 'manifest.json');
            let manifestName = dir;
            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
              manifestName = manifest.name || dir;
            }

            const controllers = Reflect.getMetadata('controllers', PluginModule) || [];
            for (const controller of controllers) {
              const rawPath = Reflect.getMetadata('path', controller);
              const controllerPath = rawPath || '';

              // Auto-prefix with manifest name: /{manifestName}/{controllerPath}
              const normalizedControllerPath = controllerPath.startsWith('/') ? controllerPath : `/${controllerPath}`;
              const fullPath = normalizedControllerPath
                ? `/${manifestName}${normalizedControllerPath}`
                : `/${manifestName}`;

              if (registeredRoutes.has(fullPath)) {
                throw new Error(`Duplicate plugin route detected: ${fullPath} in plugin ${dir}`);
              }
              registeredRoutes.add(fullPath);

              // Override controller path metadata so NestJS registers the prefixed route
              Reflect.defineMetadata('path', fullPath.replace(/^\//, ''), controller);
            }

            imports.push(PluginModule);
            logger.log(`⚙️  Loaded NestJS Plugin Module: [${PluginModule.name}] from ${dir}`);
          }
        } catch (e) {
          logger.error(`Failed to load NestJS plugin deeply from ${dir}: ${e.message}`);
        }
      }
    }

    return {
      module: PluginLoaderModule,
      imports,
    };
  }
}
