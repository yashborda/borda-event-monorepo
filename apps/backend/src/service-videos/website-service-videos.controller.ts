import { Controller, Get, Param } from '@nestjs/common';
import { ServiceVideosService } from './service-videos.service.js';

@Controller('website/services/:slug/videos')
export class WebsiteServiceVideosController {
  constructor(private readonly serviceVideosService: ServiceVideosService) {}

  @Get()
  getPublicVideos(@Param('slug') slug: string) {
    return this.serviceVideosService.findAllPublic(slug);
  }
}
