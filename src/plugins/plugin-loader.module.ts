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
      const pluginMainPath = path.join(pluginsDir, dir, 'dist', 'index.js');
      
      if (fs.existsSync(pluginMainPath)) {
        try {
          const exported = require(pluginMainPath);
          
          // Find the exported class (assuming it's a Nest Module)
          const PluginModule: any = Object.values(exported).find((val) => typeof val === 'function');
          
          if (PluginModule) {
            const controllers = Reflect.getMetadata('controllers', PluginModule) || [];
            for (const controller of controllers) {
              const rawPath = Reflect.getMetadata('path', controller);
              if (rawPath) {
                const paths = Array.isArray(rawPath) ? rawPath : [rawPath];
                for (const p of paths) {
                  const normalizedPath = p.startsWith('/') ? p : `/${p}`;
                  if (registeredRoutes.has(normalizedPath)) {
                    throw new Error(`Duplicate plugin route detected: ${normalizedPath} in plugin ${dir}`);
                  }
                  registeredRoutes.add(normalizedPath);
                }
              }
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
