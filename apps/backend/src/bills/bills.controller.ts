import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IAdminJwtPayload } from '@pkg/types';
import { CurrentUser } from '../auth/common/decorators/current-user.decorator.js';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { BillsService } from './bills.service.js';
import { CreateBillDto } from './dto/create-bill.dto.js';
import { UpdateBillDto } from './dto/update-bill.dto.js';
import { UpdateBillStatusDto } from './dto/update-bill-status.dto.js';
import { DeleteBillDto } from './dto/delete-bill.dto.js';

@Controller('admin/bills')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @RequirePermissions('bills:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('eventDateFrom') eventDateFrom?: string,
    @Query('eventDateTo') eventDateTo?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.billsService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
      customerId,
      eventDateFrom,
      eventDateTo,
      includeDeleted === 'true',
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
    );
  }

  @Post()
  @RequirePermissions('bills:create')
  create(@Body() dto: CreateBillDto, @CurrentUser() user: IAdminJwtPayload) {
    return this.billsService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermissions('bills:read')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('bills:update')
  update(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('bills:update')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBillStatusDto) {
    return this.billsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequirePermissions('bills:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteBillDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.billsService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('bills:delete')
  restore(@Param('id') id: string) {
    return this.billsService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('bills:delete')
  permanentDelete(@Param('id') id: string) {
    return this.billsService.permanentDelete(id);
  }
}
