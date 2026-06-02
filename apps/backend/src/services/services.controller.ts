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
import { ServicesService } from './services.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { DeleteServiceDto } from './dto/delete-service.dto.js';
import { AttachServiceMediaDto } from './dto/attach-service-media.dto.js';
import { ReorderServiceMediaDto } from './dto/reorder-service-media.dto.js';

@Controller('admin/services')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @RequirePermissions('services:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.servicesService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
      isActive === undefined ? undefined : isActive === 'true',
    );
  }

  @Post()
  @RequirePermissions('services:create')
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: IAdminJwtPayload) {
    return this.servicesService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermissions('services:read')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('services:update')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('services:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteServiceDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.servicesService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('services:delete')
  restore(@Param('id') id: string) {
    return this.servicesService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('services:delete')
  permanentDelete(@Param('id') id: string) {
    return this.servicesService.permanentDelete(id);
  }

  // ── Service media ──────────────────────────────────────────
  @Post(':id/media')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('services:update')
  attachMedia(@Param('id') id: string, @Body() dto: AttachServiceMediaDto) {
    return this.servicesService.attachMedia(id, dto);
  }

  @Patch(':id/media/reorder')
  @RequirePermissions('services:update')
  reorderMedia(
    @Param('id') id: string,
    @Body() dto: ReorderServiceMediaDto,
  ) {
    return this.servicesService.reorderMedia(id, dto);
  }

  @Delete(':id/media/:mediaId')
  @RequirePermissions('services:update')
  detachMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.servicesService.detachMedia(id, mediaId);
  }
}
