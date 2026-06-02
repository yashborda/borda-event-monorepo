import { Controller, Get, Param } from '@nestjs/common';
import { WebsiteCataloguesService } from './website-catalogues.service.js';

@Controller('website/catalogues')
export class WebsiteCataloguesController {
  constructor(
    private readonly websiteCataloguesService: WebsiteCataloguesService,
  ) {}

  @Get()
  getCatalogues() {
    return this.websiteCataloguesService.getCatalogues();
  }

  // Static route must come before /:slug
  @Get('slugs')
  getSlugsForStaticParams() {
    return this.websiteCataloguesService.getSlugsForStaticParams();
  }

  @Get(':slug')
  getCatalogueBySlug(@Param('slug') slug: string) {
    return this.websiteCataloguesService.getCatalogueBySlug(slug);
  }
}
