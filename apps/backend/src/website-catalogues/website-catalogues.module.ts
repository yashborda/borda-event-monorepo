import { Module } from '@nestjs/common';
import { WebsiteCataloguesController } from './website-catalogues.controller.js';
import { WebsiteCataloguesService } from './website-catalogues.service.js';

@Module({
  controllers: [WebsiteCataloguesController],
  providers: [WebsiteCataloguesService],
})
export class WebsiteCataloguesModule {}
