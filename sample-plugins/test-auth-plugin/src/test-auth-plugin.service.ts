import { Injectable } from '@nestjs/common';

@Injectable()
export class TestAuthPluginService {
  getStatus() {
    return {
      plugin: 'test-auth-plugin',
      description: 'Demo plugin for authentication and authorization',
      features: [
        'Manifest-level auth declaration',
        'Public route override via @SetMetadata',
        'Current user access via req.user',
        'Method-level permission override',
        'AuthContextService injection',
      ],
    };
  }
}
