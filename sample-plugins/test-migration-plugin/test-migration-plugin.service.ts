import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestMigrationPluginService {
  private readonly logger = new Logger(TestMigrationPluginService.name);

  getStatus() {
    return {
      status: 'Online',
      tables: ['authors', 'books'],
      relationship: 'books.author_id -> authors.id (one-to-many)',
    };
  }
}
