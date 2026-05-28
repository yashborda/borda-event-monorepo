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
import { AdminUsersService } from './admin-users.service.js';
import { AssignPermissionsDto } from './dto/assign-permissions.dto.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { DeleteAdminUserDto } from './dto/delete-admin-user.dto.js';
import { PermanentDeleteAdminUserDto } from './dto/permanent-delete-admin-user.dto.js';
import { TransferOwnershipAdminUserDto } from './dto/transfer-ownership-admin-user.dto.js';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto.js';

@Controller('admin/users')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @RequirePermissions('users:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('roleSlug') roleSlug?: string,
    @Query('isActive') isActive?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.adminUsersService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      roleSlug,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @RequirePermissions('users:create')
  create(
    @Body() dto: CreateAdminUserDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteAdminUserDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.softDelete(id, user.sub, dto.reason);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('users:delete')
  restore(@Param('id') id: string) {
    return this.adminUsersService.restore(id);
  }

  @Post(':id/transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('users:delete')
  transferOwnership(
    @Param('id') id: string,
    @Body() dto: TransferOwnershipAdminUserDto,
  ) {
    return this.adminUsersService.transferOwnership(id, dto.transferToEmail);
  }

  @Delete(':id/permanent')
  @RequirePermissions('users:delete')
  hardDelete(
    @Param('id') id: string,
    @Body() dto: PermanentDeleteAdminUserDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.hardDelete(id, user.sub, dto.transferToEmail);
  }

  @Get(':id/effective-permissions')
  @RequirePermissions('users:read')
  getEffectivePermissions(@Param('id') id: string) {
    return this.adminUsersService.getEffectivePermissions(id);
  }

  @Post(':id/roles')
  @RequirePermissions('users:update')
  assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.assignRoles(id, dto.roleIds, user.sub);
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions('users:update')
  removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.removeRole(id, roleId, user.sub);
  }

  @Post(':id/permissions')
  @RequirePermissions('users:update')
  assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.adminUsersService.assignPermissions(
      id,
      dto.permissionIds,
      user.sub,
    );
  }

  @Delete(':id/permissions/:permId')
  @RequirePermissions('users:update')
  removePermission(@Param('id') id: string, @Param('permId') permId: string) {
    return this.adminUsersService.removePermission(id, permId);
  }
}
