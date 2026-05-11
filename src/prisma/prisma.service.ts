import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    this.client = new PrismaClient({ adapter })
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}
