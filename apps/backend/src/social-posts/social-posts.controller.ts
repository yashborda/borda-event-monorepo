import {
  Body,
  Controller,
  Delete,
  Get,
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
import { SocialPostsService } from './social-posts.service.js';
import { CreateSocialPostDto } from './dto/create-social-post.dto.js';
import { UpdateSocialPostDto } from './dto/update-social-post.dto.js';
import { ReorderSocialPostsDto } from './dto/reorder-social-posts.dto.js';

@Controller('admin/social-posts')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class SocialPostsController {
  constructor(private readonly socialPostsService: SocialPostsService) {}

  @Get()
  @RequirePermissions('social-posts:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platform') platform?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.socialPostsService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      platform,
      isFeatured === undefined ? undefined : isFeatured === 'true',
      sortBy,
      sortDir === 'desc' ? 'desc' : 'asc',
    );
  }

  @Post()
  @RequirePermissions('social-posts:create')
  create(
    @Body() dto: CreateSocialPostDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.socialPostsService.create(dto, user.sub);
  }

  // Static route must come before /:id
  @Patch('reorder')
  @RequirePermissions('social-posts:update')
  reorder(@Body() dto: ReorderSocialPostsDto) {
    return this.socialPostsService.reorder(dto);
  }

  @Get(':id')
  @RequirePermissions('social-posts:read')
  findOne(@Param('id') id: string) {
    return this.socialPostsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('social-posts:update')
  update(@Param('id') id: string, @Body() dto: UpdateSocialPostDto) {
    return this.socialPostsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('social-posts:delete')
  remove(@Param('id') id: string) {
    return this.socialPostsService.remove(id);
  }
}
