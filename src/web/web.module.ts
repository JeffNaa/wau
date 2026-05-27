import { Module, OnModuleInit } from '@nestjs/common';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WebController],
  providers: [WebService],
  exports: [WebService],
})
export class WebModule implements OnModuleInit {
  constructor(private readonly webService: WebService) {}

  async onModuleInit() {
    await this.webService.seedBuiltInWidgets();
  }
}
