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
import { CataloguesService } from './catalogues.service.js';
import { CreateCatalogueDto } from './dto/create-catalogue.dto.js';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto.js';
import { DeleteCatalogueDto } from './dto/delete-catalogue.dto.js';
import { AttachCatalogueServiceDto } from './dto/attach-catalogue-service.dto.js';
import { ReorderCatalogueServicesDto } from './dto/reorder-catalogue-services.dto.js';

@Controller('admin/catalogues')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class CataloguesController {
  constructor(private readonly cataloguesService: CataloguesService) {}

  @Get()
  @RequirePermissions('catalogues:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('isPublic') isPublic?: string,
  ) {
    return this.cataloguesService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
      isPublic === undefined ? undefined : isPublic === 'true',
    );
  }

  @Post()
  @RequirePermissions('catalogues:create')
  create(
    @Body() dto: CreateCatalogueDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.cataloguesService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermissions('catalogues:read')
  findOne(@Param('id') id: string) {
    return this.cataloguesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('catalogues:update')
  update(@Param('id') id: string, @Body() dto: UpdateCatalogueDto) {
    return this.cataloguesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('catalogues:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteCatalogueDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.cataloguesService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('catalogues:delete')
  restore(@Param('id') id: string) {
    return this.cataloguesService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('catalogues:delete')
  permanentDelete(@Param('id') id: string) {
    return this.cataloguesService.permanentDelete(id);
  }

  // ── Catalogue services ─────────────────────────────────────
  @Post(':id/services')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('catalogues:update')
  attachService(
    @Param('id') id: string,
    @Body() dto: AttachCatalogueServiceDto,
  ) {
    return this.cataloguesService.attachService(id, dto);
  }

  @Patch(':id/services/reorder')
  @RequirePermissions('catalogues:update')
  reorderServices(
    @Param('id') id: string,
    @Body() dto: ReorderCatalogueServicesDto,
  ) {
    return this.cataloguesService.reorderServices(id, dto);
  }

  @Delete(':id/services/:serviceId')
  @RequirePermissions('catalogues:update')
  detachService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.cataloguesService.detachService(id, serviceId);
  }
}
