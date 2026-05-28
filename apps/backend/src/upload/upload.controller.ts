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

@Controller('admin/upload')
@UseGuards(AuthGuard('admin-jwt'))
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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
}
