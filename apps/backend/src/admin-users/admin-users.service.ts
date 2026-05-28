import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { IPermissionName } from '@pkg/types';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUserPermissions } from '../database/schema/admin-user-permissions.table.js';
import { adminUserRoles } from '../database/schema/admin-user-roles.table.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { permissions } from '../database/schema/permissions.table.js';
import { refreshTokens } from '../database/schema/refresh-tokens.table.js';
import { rolePermissions } from '../database/schema/role-permissions.table.js';
import { roles } from '../database/schema/roles.table.js';
import type { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import type { UpdateAdminUserDto } from './dto/update-admin-user.dto.js';

@Injectable()
export class AdminUsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'updatedAt',
    sortDir: 'asc' | 'desc' = 'desc',
    roleSlug?: string,
    isActive?: boolean,
    includeDeleted = false,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'email'
        ? adminUsers.email
        : sortBy === 'fullName'
          ? adminUsers.fullName
          : sortBy === 'createdAt'
            ? adminUsers.createdAt
            : sortBy === 'deletedAt'
              ? adminUsers.deletedAt
              : adminUsers.updatedAt;
    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(adminUsers.deletedAt));
    } else {
      conditions.push(isNotNull(adminUsers.deletedAt));
    }

    if (search) {
      conditions.push(
        or(
          ilike(adminUsers.email, `%${search}%`),
          ilike(adminUsers.fullName, `%${search}%`),
        ),
      );
    }

    if (roleSlug) {
      conditions.push(
        inArray(
          adminUsers.id,
          this.drizzle.db
            .select({ id: adminUserRoles.userId })
            .from(adminUserRoles)
            .innerJoin(roles, eq(adminUserRoles.roleId, roles.id))
            .where(eq(roles.slug, roleSlug)),
        ),
      );
    }

    if (isActive !== undefined) {
      conditions.push(eq(adminUsers.isActive, isActive));
    }

    const whereClause =
      conditions.length > 1
        ? and(
            ...(conditions as [
              ReturnType<typeof or>,
              ...ReturnType<typeof or>[],
            ]),
          )
        : conditions[0];

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');

    const [users, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: adminUsers.id,
          email: adminUsers.email,
          fullName: adminUsers.fullName,
          avatarUrl: adminUsers.avatarUrl,
          emailVerified: adminUsers.emailVerified,
          isActive: adminUsers.isActive,
          lastLoginAt: adminUsers.lastLoginAt,
          deletedAt: adminUsers.deletedAt,
          deletedReason: adminUsers.deletedReason,
          createdAt: adminUsers.createdAt,
          updatedAt: adminUsers.updatedAt,
          passwordHash: adminUsers.passwordHash,
          googleId: adminUsers.googleId,
          createdBy: adminUsers.createdBy,
          deletedBy: adminUsers.deletedBy,
          createdByName: createdByUser.fullName,
          deletedByName: deletedByUser.fullName,
        })
        .from(adminUsers)
        .leftJoin(createdByUser, eq(adminUsers.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(adminUsers.deletedBy, deletedByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(adminUsers)
        .where(whereClause),
    ]);

    const usersWithRoles = await Promise.all(
      users.map((u) => this.enrichUser(u)),
    );

    return { data: usersWithRoles, total, page, limit };
  }

  async findOne(id: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    return this.enrichUser(user);
  }

  async create(dto: CreateAdminUserDto, createdBy?: string) {
    const existing = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, dto.email))
      .limit(1);

    if (existing.length > 0)
      throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await this.drizzle.db
      .insert(adminUsers)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        isActive: dto.isActive ?? true,
        createdBy: createdBy,
      })
      .returning();

    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.drizzle.db
        .insert(adminUserRoles)
        .values(
          dto.roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
            assignedBy: createdBy,
          })),
        )
        .onConflictDoNothing();
    }

    return this.findOne(user.id);
  }

  async update(id: string, dto: UpdateAdminUserDto, currentUserId: string) {
    if (dto.isActive === false && id === currentUserId) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (user.deletedAt)
      throw new BadRequestException('Cannot update a deleted user');

    await this.drizzle.db
      .update(adminUsers)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(adminUsers.id, id));

    return this.findOne(id);
  }

  async softDelete(id: string, currentUserId: string, reason: string) {
    if (id === currentUserId)
      throw new BadRequestException('Cannot delete your own account');

    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (user.deletedAt)
      throw new BadRequestException('User is already deleted');

    // Revoke active sessions
    await this.drizzle.db
      .delete(refreshTokens)
      .where(
        and(eq(refreshTokens.userId, id), eq(refreshTokens.userType, 'admin')),
      );

    await this.drizzle.db
      .update(adminUsers)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: currentUserId,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id));

    return { message: 'User deleted' };
  }

  async restore(id: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (!user.deletedAt) throw new BadRequestException('User is not deleted');

    await this.drizzle.db
      .update(adminUsers)
      .set({
        deletedAt: null,
        deletedReason: null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id));

    return { message: 'User restored' };
  }

  async transferOwnership(id: string, transferToEmail: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (!user.deletedAt)
      throw new BadRequestException(
        'User must be deleted before transferring ownership',
      );

    const [transferTarget] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, transferToEmail))
      .limit(1);

    if (!transferTarget)
      throw new NotFoundException(
        `No user found with email "${transferToEmail}"`,
      );

    if (transferTarget.id === id)
      throw new BadRequestException('Transfer target cannot be the same user');

    await Promise.all([
      this.drizzle.db
        .update(adminUserRoles)
        .set({ assignedBy: transferTarget.id })
        .where(eq(adminUserRoles.assignedBy, id)),
      this.drizzle.db
        .update(adminUserPermissions)
        .set({ grantedBy: transferTarget.id })
        .where(eq(adminUserPermissions.grantedBy, id)),
    ]);

    return { message: 'Ownership transferred' };
  }

  async hardDelete(id: string, currentUserId: string, transferToEmail: string) {
    if (id === currentUserId)
      throw new BadRequestException('Cannot delete your own account');

    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (!user.deletedAt)
      throw new BadRequestException(
        'User must be soft-deleted before permanent deletion',
      );

    const [transferTarget] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, transferToEmail))
      .limit(1);

    if (!transferTarget)
      throw new NotFoundException(
        `No user found with email "${transferToEmail}"`,
      );

    if (transferTarget.id === id)
      throw new BadRequestException(
        'Transfer target cannot be the same user being deleted',
      );

    // Transfer remaining audit references
    await Promise.all([
      this.drizzle.db
        .update(adminUserRoles)
        .set({ assignedBy: transferTarget.id })
        .where(eq(adminUserRoles.assignedBy, id)),
      this.drizzle.db
        .update(adminUserPermissions)
        .set({ grantedBy: transferTarget.id })
        .where(eq(adminUserPermissions.grantedBy, id)),
    ]);

    // Revoke remaining sessions (idempotent)
    await this.drizzle.db
      .delete(refreshTokens)
      .where(
        and(eq(refreshTokens.userId, id), eq(refreshTokens.userType, 'admin')),
      );

    // Hard delete — cascades remove admin_user_roles and admin_user_permissions for this user
    await this.drizzle.db.delete(adminUsers).where(eq(adminUsers.id, id));

    return { message: 'User permanently deleted' };
  }

  async getEffectivePermissions(userId: string) {
    const userRoleRows = await this.drizzle.db
      .select({ roleId: adminUserRoles.roleId })
      .from(adminUserRoles)
      .where(eq(adminUserRoles.userId, userId));

    const roleIds = userRoleRows.map((r) => r.roleId);

    let roleNames: string[] = [];
    let rolePermNames: IPermissionName[] = [];

    if (roleIds.length > 0) {
      const roleRows = await this.drizzle.db
        .select({ name: roles.name })
        .from(roles)
        .where(inArray(roles.id, roleIds));
      roleNames = roleRows.map((r) => r.name);

      const rolePermRows = (await this.drizzle.db
        .select({ slug: permissions.slug })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id),
        )
        .where(inArray(rolePermissions.roleId, roleIds))) as Array<{
        slug: string;
      }>;
      rolePermNames = rolePermRows.map((r) => r.slug as IPermissionName);
    }

    const directPermRows = (await this.drizzle.db
      .select({ slug: permissions.slug })
      .from(adminUserPermissions)
      .innerJoin(
        permissions,
        eq(adminUserPermissions.permissionId, permissions.id),
      )
      .where(eq(adminUserPermissions.userId, userId))) as Array<{
      slug: string;
    }>;

    const directPermNames = directPermRows.map(
      (r) => r.slug as IPermissionName,
    );
    const effectivePermissions = [
      ...new Set([...rolePermNames, ...directPermNames]),
    ] as IPermissionName[];

    return {
      userId,
      roles: roleNames,
      rolePermissions: rolePermNames,
      directPermissions: directPermNames,
      effectivePermissions,
    };
  }

  async assignRoles(userId: string, roleIds: string[], assignedBy?: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');

    if (roleIds.length > 0) {
      await this.drizzle.db
        .insert(adminUserRoles)
        .values(roleIds.map((roleId) => ({ userId, roleId, assignedBy })))
        .onConflictDoNothing();
    }

    await this.drizzle.db
      .update(adminUsers)
      .set({ updatedAt: new Date() })
      .where(eq(adminUsers.id, userId));

    return this.findOne(userId);
  }

  async removeRole(userId: string, roleId: string, currentUserId: string) {
    // Prevent removing last super_admin
    const [superAdminRole] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (superAdminRole?.slug === 'super_admin') {
      const [{ total }] = await this.drizzle.db
        .select({ total: count() })
        .from(adminUserRoles)
        .where(eq(adminUserRoles.roleId, roleId));

      if (total <= 1) {
        throw new BadRequestException(
          'Cannot remove the last Super Admin user',
        );
      }

      if (userId === currentUserId) {
        throw new BadRequestException(
          'Cannot remove your own Super Admin role',
        );
      }
    }

    await this.drizzle.db
      .delete(adminUserRoles)
      .where(
        and(
          eq(adminUserRoles.userId, userId),
          eq(adminUserRoles.roleId, roleId),
        ),
      );

    await this.drizzle.db
      .update(adminUsers)
      .set({ updatedAt: new Date() })
      .where(eq(adminUsers.id, userId));

    return this.findOne(userId);
  }

  async assignPermissions(
    userId: string,
    permissionIds: string[],
    grantedBy?: string,
  ) {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');

    if (permissionIds.length > 0) {
      await this.drizzle.db
        .insert(adminUserPermissions)
        .values(
          permissionIds.map((permissionId) => ({
            userId,
            permissionId,
            grantedBy,
          })),
        )
        .onConflictDoNothing();
    }

    return this.findOne(userId);
  }

  async removePermission(userId: string, permissionId: string) {
    await this.drizzle.db
      .delete(adminUserPermissions)
      .where(
        and(
          eq(adminUserPermissions.userId, userId),
          eq(adminUserPermissions.permissionId, permissionId),
        ),
      );

    return this.findOne(userId);
  }

  private async enrichUser(user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    isActive: boolean;
    lastLoginAt: Date | null;
    deletedAt: Date | null;
    deletedReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    passwordHash: string | null;
    googleId: string | null;
    createdBy?: string | null;
    createdByName?: string | null;
    deletedBy?: string | null;
    deletedByName?: string | null;
  }) {
    const userRoleRows = await this.drizzle.db
      .select({ roleId: adminUserRoles.roleId })
      .from(adminUserRoles)
      .where(eq(adminUserRoles.userId, user.id));

    const roleIds = userRoleRows.map((r) => r.roleId);
    const userRoles =
      roleIds.length > 0
        ? await this.drizzle.db
            .select()
            .from(roles)
            .where(inArray(roles.id, roleIds))
        : [];

    const directPerms = await this.drizzle.db
      .select()
      .from(adminUserPermissions)
      .innerJoin(
        permissions,
        eq(adminUserPermissions.permissionId, permissions.id),
      )
      .where(eq(adminUserPermissions.userId, user.id));

    // Compute effective permissions from roles + direct grants
    let rolePermNames: IPermissionName[] = [];
    if (roleIds.length > 0) {
      const rolePermRows = await this.drizzle.db
        .select({ slug: permissions.slug })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id),
        )
        .where(inArray(rolePermissions.roleId, roleIds));
      rolePermNames = rolePermRows.map((r) => r.slug as IPermissionName);
    }
    const directPermNames = directPerms.map(
      (r) => r.permissions.slug as IPermissionName,
    );
    const effectivePermissions = [
      ...new Set([...rolePermNames, ...directPermNames]),
    ] as IPermissionName[];

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      deletedReason: user.deletedReason,
      createdBy: user.createdBy ?? null,
      createdByName: user.createdByName ?? null,
      deletedBy: user.deletedBy ?? null,
      deletedByName: user.deletedByName ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: userRoles.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        isSystem: r.isSystem,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      directPermissions: directPerms.map((r) => r.permissions),
      effectivePermissions,
    };
  }
}
