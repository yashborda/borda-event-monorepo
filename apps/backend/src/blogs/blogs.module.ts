import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller.js';
import { BlogsService } from './blogs.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [BlogsController],
  providers: [BlogsService, RevalidationService],
  exports: [BlogsService],
})
export class BlogsModule {}
