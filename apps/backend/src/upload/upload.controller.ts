import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from './upload.service.js';
import { R2Service } from './r2.service.js';

@Controller('admin/upload')
@UseGuards(AuthGuard('admin-jwt'))
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly r2Service: R2Service,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    return this.uploadService.saveImage(file, folder);
  }

  @Delete('image')
  @HttpCode(204)
  async deleteImage(@Body('url') url: string) {
    if (!url) throw new BadRequestException('url is required');
    await this.uploadService.deleteFileByUrl(url);
  }

  // ── Cloudflare R2 ──────────────────────────────────────────
  // Route paths keep the legacy "drive-image" name so the admin frontend keeps
  // working; storage is now Cloudflare R2.
  // Upload an image to R2 under a subfolder (defaults to "general").
  @Post('drive-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDriveImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.r2Service.uploadImage(file, folder);
  }

  // Delete an R2-backed media file (and its media_files row) by media id.
  @Delete('drive-image')
  @HttpCode(204)
  async deleteDriveImage(@Query('id') id: string) {
    if (!id) throw new BadRequestException('id (media file id) is required');
    await this.r2Service.deleteFile(id);
  }
}
