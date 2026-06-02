import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller.js';
import { ServicesService } from './services.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [ServicesController],
  providers: [ServicesService, RevalidationService],
  exports: [ServicesService],
})
export class ServicesModule {}
