import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WebsiteInquiriesService } from './website-inquiries.service.js';
import { CreateInquiryDto } from '../inquiries/dto/create-inquiry.dto.js';

@Controller('website/inquiries')
export class WebsiteInquiriesController {
  constructor(
    private readonly websiteInquiriesService: WebsiteInquiriesService,
  ) {}

  // Public, no auth. Tighter than the global 60/min throttle to deter spam:
  // 5 submissions per minute per IP.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  create(@Body() dto: CreateInquiryDto) {
    return this.websiteInquiriesService.create(dto);
  }
}
