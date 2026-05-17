import { Module } from '@nestjs/common';
import { PluginMigrationService } from './plugin-migration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PluginMigrationService],
  exports: [PluginMigrationService],
})
export class PluginMigrationModule {}
