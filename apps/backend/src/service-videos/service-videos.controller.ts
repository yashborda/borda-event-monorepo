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
import { AuthGuard } from '@nestjs/passport';
import type { IAdminJwtPayload } from '@pkg/types';
import { CurrentUser } from '../auth/common/decorators/current-user.decorator.js';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { ServiceVideosService } from './service-videos.service.js';
import { CreateServiceVideoDto } from './dto/create-service-video.dto.js';
import { ReorderServiceVideosDto } from './dto/reorder-service-videos.dto.js';

@Controller('admin/services/:serviceId/videos')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class ServiceVideosController {
  constructor(private readonly serviceVideosService: ServiceVideosService) {}

  // Multipart: `file` is required only for type='drive'; instagram sends fields only.
  @Post()
  @UseInterceptors(FileInterceptor('file'))
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

  @Delete(':videoId')
  @RequirePermissions('service-videos:delete')
  deleteVideo(
    @Param('serviceId') serviceId: string,
    @Param('videoId') videoId: string,
  ) {
    return this.serviceVideosService.remove(videoId, serviceId);
  }
}
