import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Pool, QueryResult } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient
  readonly pool: Pool

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(this.pool)
    this.client = new PrismaClient({ adapter })
  }

  async query(sql: string, params?: any[]): Promise<QueryResult<any>> {
    try {
      return await this.pool.query(sql, params)
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Database connection failed')
      }
      throw error
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
    await this.pool.end()
  }
}
