import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { tmpdir } from 'node:os';
import { AuthGuard } from '@nestjs/passport';
import type { IAdminJwtPayload } from '@pkg/types';
import { CurrentUser } from '../auth/common/decorators/current-user.decorator.js';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { ServiceVideosService } from './service-videos.service.js';
import { CreateServiceVideoDto } from './dto/create-service-video.dto.js';
import { ReorderServiceVideosDto } from './dto/reorder-service-videos.dto.js';
import { RenameServiceVideoDto } from './dto/rename-service-video.dto.js';

@Controller('admin/services/:serviceId/videos')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class ServiceVideosController {
  constructor(private readonly serviceVideosService: ServiceVideosService) {}

  // Multipart: `file` is required only for type='drive'; instagram sends fields only.
  // Videos stream to a temp file on disk (NOT buffered in memory) so large
  // uploads (250–350 MB) don't blow the instance's RAM limit. DriveService
  // streams from file.path and removes the temp file afterwards.
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: tmpdir() }),
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  @RequirePermissions('service-videos:create')
  createVideo(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateServiceVideoDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.serviceVideosService.create(serviceId, dto, file, user.sub);
  }

  @Get()
  @RequirePermissions('service-videos:read')
  listVideos(@Param('serviceId') serviceId: string) {
    return this.serviceVideosService.findAll(serviceId);
  }

  // Static route must come before /:videoId
  @Patch('reorder')
  @RequirePermissions('service-videos:update')
  reorderVideos(
    @Param('serviceId') serviceId: string,
    @Body() dto: ReorderServiceVideosDto,
  ) {
    return this.serviceVideosService.reorder(serviceId, dto.items);
  }

  @Patch(':videoId/featured')
  @RequirePermissions('service-videos:update')
  setVideoFeatured(
    @Param('serviceId') serviceId: string,
    @Param('videoId') videoId: string,
  ) {
    return this.serviceVideosService.setFeatured(videoId, serviceId);
  }

  @Patch(':videoId/name')
  @RequirePermissions('service-videos:update')
  renameVideo(
    @Param('serviceId') serviceId: string,
    @Param('videoId') videoId: string,
    @Body() dto: RenameServiceVideoDto,
  ) {
    return this.serviceVideosService.rename(videoId, serviceId, dto.title);
  }

  @Delete(':videoId')
  @RequirePermissions('service-videos:delete')
  deleteVideo(
    @Param('serviceId') serviceId: string,
    @Param('videoId') videoId: string,
  ) {
    return this.serviceVideosService.remove(videoId, serviceId);
  }
}
