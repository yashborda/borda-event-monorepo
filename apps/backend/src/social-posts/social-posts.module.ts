import { Module } from '@nestjs/common';
import { SocialPostsController } from './social-posts.controller.js';
import { SocialPostsService } from './social-posts.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [SocialPostsController],
  providers: [SocialPostsService, RevalidationService],
  exports: [SocialPostsService],
})
export class SocialPostsModule {}
