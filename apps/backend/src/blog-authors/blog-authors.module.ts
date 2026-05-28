import { Module } from '@nestjs/common';
import { BlogAuthorsController } from './blog-authors.controller.js';
import { BlogAuthorsService } from './blog-authors.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [BlogAuthorsController],
  providers: [BlogAuthorsService, RevalidationService],
  exports: [BlogAuthorsService],
})
export class BlogAuthorsModule {}
