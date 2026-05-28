import { Module } from '@nestjs/common';
import { WebsiteBlogController } from './website-blog.controller.js';
import { WebsiteBlogService } from './website-blog.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';

@Module({
  controllers: [WebsiteBlogController],
  providers: [WebsiteBlogService, RevalidationService],
})
export class WebsiteBlogModule {}
