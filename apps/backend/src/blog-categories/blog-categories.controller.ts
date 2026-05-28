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
import { BlogCategoriesService } from './blog-categories.service.js';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto.js';
import { DeleteBlogCategoryDto } from './dto/delete-blog-category.dto.js';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto.js';

@Controller('admin/blog-categories')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class BlogCategoriesController {
  constructor(private readonly blogCategoriesService: BlogCategoriesService) {}

  @Get()
  @RequirePermissions('blog-categories:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('statusFilter') statusFilter?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.blogCategoriesService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      statusFilter === 'draft' || statusFilter === 'published'
        ? statusFilter
        : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @RequirePermissions('blog-categories:create')
  create(
    @Body() dto: CreateBlogCategoryDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogCategoriesService.create(dto, user.sub);
  }

  @Post('revalidate-all')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-categories:revalidate')
  revalidateAll() {
    return this.blogCategoriesService.revalidateAll();
  }

  @Get(':id')
  @RequirePermissions('blog-categories:read')
  findOne(@Param('id') id: string) {
    return this.blogCategoriesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('blog-categories:update')
  update(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
    return this.blogCategoriesService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('blog-categories:update')
  toggleStatus(@Param('id') id: string) {
    return this.blogCategoriesService.toggleStatus(id);
  }

  @Delete(':id')
  @RequirePermissions('blog-categories:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteBlogCategoryDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogCategoriesService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-categories:delete')
  restore(@Param('id') id: string) {
    return this.blogCategoriesService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('blog-categories:delete')
  permanentDelete(@Param('id') id: string) {
    return this.blogCategoriesService.permanentDelete(id);
  }

  @Post(':id/revalidate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-categories:revalidate')
  revalidateOne(@Param('id') id: string) {
    return this.blogCategoriesService.revalidateOne(id);
  }
}
