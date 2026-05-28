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
import { BlogTagsService } from './blog-tags.service.js';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto.js';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto.js';
import { DeleteBlogTagDto } from './dto/delete-blog-tag.dto.js';

@Controller('admin/blog-tags')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class BlogTagsController {
  constructor(private readonly blogTagsService: BlogTagsService) {}

  @Get()
  @RequirePermissions('blog-tags:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('statusFilter') statusFilter?: string,
  ) {
    const validStatus =
      statusFilter === 'draft' || statusFilter === 'published'
        ? statusFilter
        : undefined;
    return this.blogTagsService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
      validStatus,
    );
  }

  @Post()
  @RequirePermissions('blog-tags:create')
  create(@Body() dto: CreateBlogTagDto, @CurrentUser() user: IAdminJwtPayload) {
    return this.blogTagsService.create(dto, user.sub);
  }

  @Post('revalidate-all')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-tags:revalidate')
  revalidateAll() {
    return this.blogTagsService.revalidateAll();
  }

  @Get(':id')
  @RequirePermissions('blog-tags:read')
  findOne(@Param('id') id: string) {
    return this.blogTagsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('blog-tags:update')
  update(@Param('id') id: string, @Body() dto: UpdateBlogTagDto) {
    return this.blogTagsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('blog-tags:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteBlogTagDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogTagsService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-tags:delete')
  restore(@Param('id') id: string) {
    return this.blogTagsService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('blog-tags:delete')
  permanentDelete(@Param('id') id: string) {
    return this.blogTagsService.permanentDelete(id);
  }

  @Post(':id/revalidate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-tags:revalidate')
  revalidateOne(@Param('id') id: string) {
    return this.blogTagsService.revalidateOne(id);
  }
}
