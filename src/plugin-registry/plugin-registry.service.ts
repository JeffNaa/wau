import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PluginRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.pluginRegistry.findMany();
  }

  async findOne(name: string) {
    return this.prisma.client.pluginRegistry.findUnique({ where: { name } });
  }

  async create(data: { name: string; version: string; manifest: any }) {
    return this.prisma.client.pluginRegistry.create({ data });
  }

  async update(name: string, data: { version?: string; manifest?: any }) {
    return this.prisma.client.pluginRegistry.update({ where: { name }, data });
  }

  async upsert(name: string, data: { version: string; manifest: any }) {
    return this.prisma.client.pluginRegistry.upsert({
      where: { name },
      update: { version: data.version, manifest: data.manifest },
      create: { name, version: data.version, manifest: data.manifest },
    });
  }

  async remove(name: string) {
    return this.prisma.client.pluginRegistry.delete({ where: { name } });
  }
}
