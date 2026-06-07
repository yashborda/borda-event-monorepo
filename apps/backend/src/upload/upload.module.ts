import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';
import { DriveService } from './drive.service.js';

@Module({
  controllers: [UploadController],
  providers: [UploadService, DriveService],
  exports: [UploadService, DriveService],
})
export class UploadModule {}
