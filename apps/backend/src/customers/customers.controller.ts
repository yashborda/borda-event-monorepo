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
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { DeleteCustomerDto } from './dto/delete-customer.dto.js';

@Controller('admin/customers')
@UseGuards(AuthGuard('admin-jwt'), PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions('customers:read')
  listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.customersService.listAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      sortBy,
      sortDir === 'asc' ? 'asc' : 'desc',
      includeDeleted === 'true',
    );
  }

  // Static route must come before /:id
  @Get('by-phone')
  @RequirePermissions('customers:read')
  findByPhone(@Query('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Post()
  @RequirePermissions('customers:create')
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.customersService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('customers:update')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('customers:delete')
  softDelete(
    @Param('id') id: string,
    @Body() dto: DeleteCustomerDto,
    @CurrentUser() user: IAdminJwtPayload,
  ) {
    return this.customersService.softDelete(id, dto.reason, user.sub);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('customers:delete')
  restore(@Param('id') id: string) {
    return this.customersService.restore(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('customers:delete')
  permanentDelete(@Param('id') id: string) {
    return this.customersService.permanentDelete(id);
  }
}
