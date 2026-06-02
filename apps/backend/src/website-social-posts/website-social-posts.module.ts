import { Module } from '@nestjs/common';
import { WebsiteSocialPostsController } from './website-social-posts.controller.js';
import { WebsiteSocialPostsService } from './website-social-posts.service.js';

@Module({
  controllers: [WebsiteSocialPostsController],
  providers: [WebsiteSocialPostsService],
})
export class WebsiteSocialPostsModule {}
