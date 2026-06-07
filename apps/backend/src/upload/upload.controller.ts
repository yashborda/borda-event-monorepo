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
import { DriveService } from './drive.service.js';

@Controller('admin/upload')
@UseGuards(AuthGuard('admin-jwt'))
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly driveService: DriveService,
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

  // ── Google Drive ───────────────────────────────────────────
  // Upload an image to Drive under a subfolder (defaults to "general").
  @Post('drive-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDriveImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.driveService.uploadImage(file, folder);
  }

  // Delete a Drive-backed media file (and its media_files row) by media id.
  @Delete('drive-image')
  @HttpCode(204)
  async deleteDriveImage(@Query('id') id: string) {
    if (!id) throw new BadRequestException('id (media file id) is required');
    await this.driveService.deleteFile(id);
  }
}
