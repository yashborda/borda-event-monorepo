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
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { AssignPermissionsDto } from './dto/assign-permissions.dto.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { RolesService } from './roles.service.js';

@Controller('admin/roles')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.rolesService.listAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      search,
      sortBy,
      sortDir,
    );
  }

  @Post()
  @RequirePermissions('roles:create')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @RequirePermissions('roles:create', 'roles:update')
  assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, dto.permissionIds);
  }

  @Delete(':id/permissions/:permId')
  @RequirePermissions('roles:update')
  removePermission(@Param('id') id: string, @Param('permId') permId: string) {
    return this.rolesService.removePermission(id, permId);
  }
}
