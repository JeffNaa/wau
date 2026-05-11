import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PluginDataService {
  constructor(private readonly prisma: PrismaService) {}

  async get(plugin: string, key: string) {
    return this.prisma.client.pluginData.findUnique({
      where: { plugin_key: { plugin, key } },
    });
  }

  async set(plugin: string, key: string, data: any) {
    return this.prisma.client.pluginData.upsert({
      where: { plugin_key: { plugin, key } },
      update: { data },
      create: { plugin, key, data },
    });
  }

  async remove(plugin: string, key: string) {
    return this.prisma.client.pluginData.delete({
      where: { plugin_key: { plugin, key } },
    });
  }

  async list(plugin: string) {
    return this.prisma.client.pluginData.findMany({ where: { plugin } });
  }
}
