import { Module } from '@nestjs/common';
import { WebsiteInquiriesController } from './website-inquiries.controller.js';
import { WebsiteInquiriesService } from './website-inquiries.service.js';

@Module({
  controllers: [WebsiteInquiriesController],
  providers: [WebsiteInquiriesService],
})
export class WebsiteInquiriesModule {}
