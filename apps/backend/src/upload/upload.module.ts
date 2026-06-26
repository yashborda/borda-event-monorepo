import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';
import { R2Service } from './r2.service.js';

@Module({
  controllers: [UploadController],
  providers: [UploadService, R2Service],
  exports: [UploadService, R2Service],
})
export class UploadModule {}
