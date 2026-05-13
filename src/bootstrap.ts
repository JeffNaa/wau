import { NestFactory } from '@nestjs/core';
import * as path from 'path';

// Store app reference on global so it survives module cache clears during restart
const g = global as any;
if (!g.__wauApp) g.__wauApp = undefined;
if (!g.__wauRestarting) g.__wauRestarting = false;

export async function bootstrap() {
  // Dynamically require AppModule so it picks up fresh code after cache clear
  const { AppModule } = require('./app.module');
  g.__wauApp = await NestFactory.create(AppModule);
  await g.__wauApp.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`);
}

export async function restart(maxRetries = 10) {
  if (g.__wauRestarting) {
    console.log('⏳ Restart already in progress...');
    return;
  }

  if (!g.__wauApp) {
    console.error('❌ Cannot restart: app is not initialized');
    throw new Error('App is not initialized');
  }

  g.__wauRestarting = true;

  try {
    console.log('♻️  Restarting server to reload plugins...');

    await g.__wauApp.close();
    console.log('🔌 Server closed');

    // Clear require cache for clean reload
    // Must clear app modules too, otherwise AppModule's @Module() metadata
    // (including PluginLoaderModule.forRoot()'s imports array) stays stale
    const projectDir = process.cwd();
    const nodeModules = path.join(projectDir, 'node_modules');
    let cleared = 0;
    Object.keys(require.cache).forEach((key) => {
      if (key.startsWith(projectDir) && !key.startsWith(nodeModules)) {
        delete require.cache[key];
        cleared++;
      }
    });
    console.log(`🧹 Cleared ${cleared} require cache entries`);

    // Wait for port to be fully released by OS
    await new Promise((r) => setTimeout(r, 800));

    // Try to restart with retries in case port is still busy
    for (let i = 0; i < maxRetries; i++) {
      try {
        await bootstrap();
        console.log('✅ Server restarted successfully');
        g.__wauRestarting = false;
        return;
      } catch (err: any) {
        if (err.code === 'EADDRINUSE') {
          console.log(`⏳ Port busy, retrying... (${i + 1}/${maxRetries})`);
          await new Promise((r) => setTimeout(r, 500));
        } else {
          throw err;
        }
      }
    }

    throw new Error('Failed to restart server: port still in use after retries');
  } catch (err) {
    g.__wauRestarting = false;
    throw err;
  }
}
