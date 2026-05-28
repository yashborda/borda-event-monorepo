import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, ne, or } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUserRoles } from '../database/schema/admin-user-roles.table.js';
import { permissions } from '../database/schema/permissions.table.js';
import { rolePermissions } from '../database/schema/role-permissions.table.js';
import { roles } from '../database/schema/roles.table.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy?: string,
    sortDir?: string,
  ) {
    const offset = (page - 1) * limit;
    const where = search
      ? or(ilike(roles.name, `%${search}%`), ilike(roles.slug, `%${search}%`))
      : undefined;

    const sortableColumns = {
      name: roles.name,
      slug: roles.slug,
      updatedAt: roles.updatedAt,
      createdAt: roles.createdAt,
    } as const;
    const sortCol =
      sortBy && sortBy in sortableColumns
        ? sortableColumns[sortBy as keyof typeof sortableColumns]
        : roles.updatedAt;
    const order = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);

    const [pageRoles, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(roles)
        .where(where)
        .orderBy(order)
        .limit(limit)
        .offset(offset),
      this.drizzle.db.select({ total: count() }).from(roles).where(where),
    ]);

    const data = await Promise.all(
      pageRoles.map(async (role) => {
        const perms = await this.drizzle.db
          .select({ id: permissions.id, slug: permissions.slug })
          .from(rolePermissions)
          .innerJoin(
            permissions,
            eq(rolePermissions.permissionId, permissions.id),
          )
          .where(eq(rolePermissions.roleId, role.id));

        const [{ userCount }] = await this.drizzle.db
          .select({ userCount: count() })
          .from(adminUserRoles)
          .where(eq(adminUserRoles.roleId, role.id));

        return { ...role, permissions: perms, userCount };
      }),
    );

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const [role] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!role) throw new NotFoundException('Role not found');

    const perms = await this.drizzle.db
      .select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, id));

    const [{ userCount }] = await this.drizzle.db
      .select({ userCount: count() })
      .from(adminUserRoles)
      .where(eq(adminUserRoles.roleId, id));

    return { ...role, permissions: perms.map((r) => r.permissions), userCount };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.name, dto.name))
      .limit(1);

    if (existing.length > 0)
      throw new ConflictException('Role name already exists');

    if (dto.slug) {
      const existingSlug = await this.drizzle.db
        .select()
        .from(roles)
        .where(eq(roles.slug, dto.slug))
        .limit(1);
      if (existingSlug.length > 0)
        throw new ConflictException('Role slug already exists');
    }

    const [role] = await this.drizzle.db
      .insert(roles)
      .values({ name: dto.name, slug: dto.slug, description: dto.description })
      .returning();

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.drizzle.db
        .insert(rolePermissions)
        .values(
          dto.permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        )
        .onConflictDoNothing();
    }

    return this.findOne(role.id);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const [role] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!role) throw new NotFoundException('Role not found');

    if (role.isSystem && dto.name && dto.name !== role.name) {
      throw new BadRequestException('Cannot rename system roles');
    }

    if (dto.slug) {
      const existingSlug = await this.drizzle.db
        .select()
        .from(roles)
        .where(and(eq(roles.slug, dto.slug), ne(roles.id, id)))
        .limit(1);
      if (existingSlug.length > 0)
        throw new ConflictException('Role slug already exists');
    }

    await this.drizzle.db
      .update(roles)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(roles.id, id));

    return this.findOne(id);
  }

  async remove(id: string) {
    const [role] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem)
      throw new BadRequestException('Cannot delete system roles');

    await this.drizzle.db.delete(roles).where(eq(roles.id, id));
    return { message: 'Role deleted' };
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const [role] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role) throw new NotFoundException('Role not found');

    if (permissionIds.length > 0) {
      await this.drizzle.db
        .insert(rolePermissions)
        .values(permissionIds.map((permissionId) => ({ roleId, permissionId })))
        .onConflictDoNothing();
    }

    await this.drizzle.db
      .update(roles)
      .set({ updatedAt: new Date() })
      .where(eq(roles.id, roleId));

    return this.findOne(roleId);
  }

  async removePermission(roleId: string, permissionId: string) {
    await this.drizzle.db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId),
        ),
      );

    await this.drizzle.db
      .update(roles)
      .set({ updatedAt: new Date() })
      .where(eq(roles.id, roleId));

    return this.findOne(roleId);
  }
}
