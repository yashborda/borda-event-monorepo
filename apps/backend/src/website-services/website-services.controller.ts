import { Controller, Get, Param } from '@nestjs/common';
import { WebsiteServicesService } from './website-services.service.js';

@Controller('website/services')
export class WebsiteServicesController {
  constructor(
    private readonly websiteServicesService: WebsiteServicesService,
  ) {}

  @Get()
  getServices() {
    return this.websiteServicesService.getServices();
  }

  // Static route must come before /:slug
  @Get('slugs')
  getSlugsForStaticParams() {
    return this.websiteServicesService.getSlugsForStaticParams();
  }

  @Get(':slug')
  getServiceBySlug(@Param('slug') slug: string) {
    return this.websiteServicesService.getServiceBySlug(slug);
  }
}
