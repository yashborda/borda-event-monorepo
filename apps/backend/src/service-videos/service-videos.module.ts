import { Module } from '@nestjs/common';
import { ServiceVideosController } from './service-videos.controller.js';
import { WebsiteServiceVideosController } from './website-service-videos.controller.js';
import { ServiceVideosService } from './service-videos.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [ServiceVideosController, WebsiteServiceVideosController],
  providers: [ServiceVideosService, RevalidationService],
  exports: [ServiceVideosService],
})
export class ServiceVideosModule {}
