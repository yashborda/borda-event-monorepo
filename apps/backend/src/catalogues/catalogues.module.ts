import { Module } from '@nestjs/common';
import { CataloguesController } from './catalogues.controller.js';
import { CataloguesService } from './catalogues.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [CataloguesController],
  providers: [CataloguesService, RevalidationService],
  exports: [CataloguesService],
})
export class CataloguesModule {}
