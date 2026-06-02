import { Controller, Get } from '@nestjs/common';
import { WebsiteSocialPostsService } from './website-social-posts.service.js';

@Controller('website/social-posts')
export class WebsiteSocialPostsController {
  constructor(
    private readonly websiteSocialPostsService: WebsiteSocialPostsService,
  ) {}

  @Get()
  getFeatured() {
    return this.websiteSocialPostsService.getFeatured();
  }
}
