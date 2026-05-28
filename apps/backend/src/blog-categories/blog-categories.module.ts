import { Module } from '@nestjs/common';
import { BlogCategoriesController } from './blog-categories.controller.js';
import { BlogCategoriesService } from './blog-categories.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [BlogCategoriesController],
  providers: [BlogCategoriesService, RevalidationService],
  exports: [BlogCategoriesService],
})
export class BlogCategoriesModule {}
