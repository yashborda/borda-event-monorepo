import { Module } from '@nestjs/common';
import { BlogTagsController } from './blog-tags.controller.js';
import { BlogTagsService } from './blog-tags.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';

@Module({
  controllers: [BlogTagsController],
  providers: [BlogTagsService, RevalidationService],
  exports: [BlogTagsService],
})
export class BlogTagsModule {}
