import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/common/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/common/decorators/require-permissions.decorator.js';
import { PermissionsService } from './permissions.service.js';

@Controller('admin/permissions')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions:read')
  listAll() {
    return this.permissionsService.listAll();
  }
}
