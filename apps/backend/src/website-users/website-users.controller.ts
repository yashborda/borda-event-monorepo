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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IAdminJwtPayload } from '@pkg/types';
import { CurrentUser } from '../auth/common/decorators/current-user.decorator.js';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { WebsiteUsersService } from './website-users.service.js';
import { CreateWebsiteUserDto } from './dto/create-website-user.dto.js';
import { UpdateWebsiteUserDto } from './dto/update-website-user.dto.js';
import { DeleteWebsiteUserDto } from './dto/delete-website-user.dto.js';

@Controller('admin/website-users')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class WebsiteUsersController {
  constructor(private readonly websiteUsersService: WebsiteUsersService) {}

  @Get()
  @RequirePermissions('website-users:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('emailVerified') emailVerified?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.websiteUsersService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
      emailVerified === 'true'
        ? true
        : emailVerified === 'false'
          ? false
          : undefined,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post()
  @RequirePermissions('website-users:create')
  create(
    @Body() dto: CreateWebsiteUserDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.websiteUsersService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermissions('website-users:read')
  findOne(@Param('id') id: string) {
    return this.websiteUsersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('website-users:update')
  update(@Param('id') id: string, @Body() dto: UpdateWebsiteUserDto) {
    return this.websiteUsersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('website-users:delete')
  remove(
    @Param('id') id: string,
    @Body() dto: DeleteWebsiteUserDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.websiteUsersService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('website-users:delete')
  restore(@Param('id') id: string) {
    return this.websiteUsersService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('website-users:delete')
  hardDelete(@Param('id') id: string) {
    return this.websiteUsersService.hardDelete(id);
  }
}
