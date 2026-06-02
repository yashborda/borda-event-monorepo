import { Module } from '@nestjs/common';
import { WebsiteServicesController } from './website-services.controller.js';
import { WebsiteServicesService } from './website-services.service.js';

@Module({
  controllers: [WebsiteServicesController],
  providers: [WebsiteServicesService],
})
export class WebsiteServicesModule {}
