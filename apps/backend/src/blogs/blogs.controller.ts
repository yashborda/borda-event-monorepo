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
import { BlogsService } from './blogs.service.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { DeleteBlogDto } from './dto/delete-blog.dto.js';
import { PublishBlogDto } from './dto/publish-blog.dto.js';

@Controller('admin/blogs')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @RequirePermissions('blogs:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('statusFilter') statusFilter?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.blogsService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
      statusFilter,
      categoryId,
      tagId,
      authorId,
    );
  }

  @Post()
  @RequirePermissions('blogs:create')
  create(@Body() dto: CreateBlogDto, @CurrentUser() user: IAdminJwtPayload) {
    return this.blogsService.create(dto, user.sub);
  }

  @Post('revalidate-all')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blogs:revalidate')
  revalidateAll() {
    return this.blogsService.revalidateAll();
  }

  @Get(':id')
  @RequirePermissions('blogs:read')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('blogs:update')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('blogs:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteBlogDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogsService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blogs:delete')
  restore(@Param('id') id: string) {
    return this.blogsService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('blogs:delete')
  permanentDelete(@Param('id') id: string) {
    return this.blogsService.permanentDelete(id);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blogs:publish')
  publish(
    @Param('id') id: string,
    @Body() dto: PublishBlogDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.blogsService.publish(id, user.sub);
  }

  @Post(':id/revalidate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('blogs:revalidate')
  revalidateOne(@Param('id') id: string) {
    return this.blogsService.revalidateOne(id);
  }
}
