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
import { BlogAuthorsService } from './blog-authors.service.js';
import { CreateBlogAuthorDto } from './dto/create-blog-author.dto.js';
import { UpdateBlogAuthorDto } from './dto/update-blog-author.dto.js';
import { DeleteBlogAuthorDto } from './dto/delete-blog-author.dto.js';
import { TransferBlogsBlogAuthorDto } from './dto/transfer-blogs-blog-author.dto.js';

@Controller('admin/blog-authors')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class BlogAuthorsController {
  constructor(private readonly blogAuthorsService: BlogAuthorsService) {}

  @Get()
  @RequirePermissions('blog-authors:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('statusFilter') statusFilter?: string,
  ) {
    return this.blogAuthorsService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
      statusFilter,
    );
  }

  @Post()
  @RequirePermissions('blog-authors:create')
  create(
    @Body() dto: CreateBlogAuthorDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogAuthorsService.create(dto, user.sub);
  }

  @Post('revalidate-all')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-authors:revalidate')
  revalidateAll() {
    return this.blogAuthorsService.revalidateAll();
  }

  @Get(':id')
  @RequirePermissions('blog-authors:read')
  findOne(@Param('id') id: string) {
    return this.blogAuthorsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('blog-authors:update')
  update(@Param('id') id: string, @Body() dto: UpdateBlogAuthorDto) {
    return this.blogAuthorsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('blog-authors:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteBlogAuthorDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogAuthorsService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-authors:delete')
  restore(@Param('id') id: string) {
    return this.blogAuthorsService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('blog-authors:delete')
  permanentDelete(
    @Param('id') id: string,
    @Body() dto: TransferBlogsBlogAuthorDto,
  ) {
    return this.blogAuthorsService.permanentDelete(id, dto.transferToAuthorId);
  }

  @Post(':id/revalidate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blog-authors:revalidate')
  revalidateOne(@Param('id') id: string) {
    return this.blogAuthorsService.revalidateOne(id);
  }
}
