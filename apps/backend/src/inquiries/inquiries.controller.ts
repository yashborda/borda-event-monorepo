import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { InquiriesService } from './inquiries.service.js';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto.js';
import { LinkInquiryCustomerDto } from './dto/link-inquiry-customer.dto.js';

@Controller('admin/inquiries')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @RequirePermissions('inquiries:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('catalogueId') catalogueId?: string,
  ) {
    return this.inquiriesService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
      catalogueId,
    );
  }

  @Get(':id')
  @RequirePermissions('inquiries:read')
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermissions('inquiries:update')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    return this.inquiriesService.updateStatus(id, dto.status);
  }

  @Patch(':id/customer')
  @RequirePermissions('inquiries:update')
  linkCustomer(
    @Param('id') id: string,
    @Body() dto: LinkInquiryCustomerDto,
  ) {
    return this.inquiriesService.linkCustomer(id, dto.customerId ?? null);
  }
}
