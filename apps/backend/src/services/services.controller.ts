import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { IAdminJwtPayload } from '@pkg/types';
import { CurrentUser } from '../auth/common/decorators/current-user.decorator.js';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { ServicesService } from './services.service.js';
import { ServiceThemesService } from './service-themes.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { DeleteServiceDto } from './dto/delete-service.dto.js';
import { ReorderServiceMediaDto } from './dto/reorder-service-media.dto.js';
import { RenameServiceMediaDto } from './dto/rename-service-media.dto.js';
import { CreateServiceThemeDto } from './dto/create-service-theme.dto.js';
import { UpdateServiceThemeDto } from './dto/update-service-theme.dto.js';
import { ReorderServiceThemesDto } from './dto/reorder-service-themes.dto.js';
import { BulkDeleteServiceThemesDto } from './dto/bulk-delete-service-themes.dto.js';

@Controller('admin/services')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly themesService: ServiceThemesService,
  ) {}

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
  // Upload an image → Drive (subfolder = service name) → media_files → attach.
  // Optional themeId attaches the media to a specific theme; omit for service-level.
  @Post(':id/media')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions('services:update')
  attachMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('themeId') themeId?: string,
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.servicesService.attachMedia(id, file, themeId);
  }

  @Patch(':id/media/reorder')
  @RequirePermissions('services:update')
  reorderMedia(@Param('id') id: string, @Body() dto: ReorderServiceMediaDto) {
    return this.servicesService.reorderMedia(id, dto);
  }

  @Patch(':id/media/:mediaId/featured')
  @RequirePermissions('services:update')
  setMediaFeatured(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.servicesService.setMediaFeatured(id, mediaId);
  }

  @Patch(':id/media/:mediaId/name')
  @RequirePermissions('services:update')
  renameMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @Body() dto: RenameServiceMediaDto,
  ) {
    return this.servicesService.renameMedia(id, mediaId, dto.name);
  }

  @Delete(':id/media/:mediaId')
  @RequirePermissions('services:update')
  detachMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.servicesService.detachMedia(id, mediaId);
  }

  // ── Service themes ─────────────────────────────────────────
  @Get(':id/themes')
  @RequirePermissions('services:read')
  listThemes(@Param('id') id: string) {
    return this.themesService.listAll(id);
  }

  @Post(':id/themes')
  @RequirePermissions('services:update')
  createTheme(
    @Param('id') id: string,
    @Body() dto: CreateServiceThemeDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.themesService.create(id, dto, user.sub);
  }

  @Patch(':id/themes/reorder')
  @RequirePermissions('services:update')
  reorderThemes(
    @Param('id') id: string,
    @Body() dto: ReorderServiceThemesDto,
  ) {
    return this.themesService.reorder(id, dto.themeIds);
  }

  @Post(':id/themes/bulk-delete')
  @RequirePermissions('services:update')
  bulkDeleteThemes(
    @Param('id') id: string,
    @Body() dto: BulkDeleteServiceThemesDto,
  ) {
    return this.themesService.bulkRemove(id, dto.themeIds);
  }

  @Patch(':id/themes/:themeId')
  @RequirePermissions('services:update')
  updateTheme(
    @Param('id') id: string,
    @Param('themeId') themeId: string,
    @Body() dto: UpdateServiceThemeDto,
  ) {
    return this.themesService.update(id, themeId, dto);
  }

  @Delete(':id/themes/:themeId')
  @RequirePermissions('services:update')
  deleteTheme(
    @Param('id') id: string,
    @Param('themeId') themeId: string,
  ) {
    return this.themesService.remove(id, themeId);
  }
}
