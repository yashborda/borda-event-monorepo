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
  isNotNull,
  isNull,
  or,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { websiteUsers } from '../database/schema/website-users.table.js';
import type { CreateWebsiteUserDto } from './dto/create-website-user.dto.js';
import type { UpdateWebsiteUserDto } from './dto/update-website-user.dto.js';

@Injectable()
export class WebsiteUsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc',
    includeDeleted = false,
    emailVerified?: boolean,
    isActive?: boolean,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'email'
        ? websiteUsers.email
        : sortBy === 'fullName'
          ? websiteUsers.fullName
          : sortBy === 'lastLoginAt'
            ? websiteUsers.lastLoginAt
            : sortBy === 'deletedAt'
              ? websiteUsers.deletedAt
              : websiteUsers.createdAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(websiteUsers.deletedAt));
    } else {
      conditions.push(isNotNull(websiteUsers.deletedAt));
    }

    if (search) {
      conditions.push(
        or(
          ilike(websiteUsers.email, `%${search}%`),
          ilike(websiteUsers.fullName, `%${search}%`),
        ),
      );
    }

    if (emailVerified !== undefined) {
      conditions.push(eq(websiteUsers.emailVerified, emailVerified));
    }

    if (isActive !== undefined) {
      conditions.push(eq(websiteUsers.isActive, isActive));
    }

    const whereClause =
      conditions.length > 1
        ? and(
            ...(conditions as [
              ReturnType<typeof isNull>,
              ...ReturnType<typeof isNull>[],
            ]),
          )
        : conditions[0];

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');

    const [users, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: websiteUsers.id,
          email: websiteUsers.email,
          fullName: websiteUsers.fullName,
          avatarUrl: websiteUsers.avatarUrl,
          emailVerified: websiteUsers.emailVerified,
          isActive: websiteUsers.isActive,
          lastLoginAt: websiteUsers.lastLoginAt,
          deletedAt: websiteUsers.deletedAt,
          deletedReason: websiteUsers.deletedReason,
          createdAt: websiteUsers.createdAt,
          updatedAt: websiteUsers.updatedAt,
          passwordHash: websiteUsers.passwordHash,
          googleId: websiteUsers.googleId,
          createdBy: websiteUsers.createdBy,
          deletedBy: websiteUsers.deletedBy,
          createdByName: createdByUser.fullName,
          deletedByName: deletedByUser.fullName,
        })
        .from(websiteUsers)
        .leftJoin(createdByUser, eq(websiteUsers.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(websiteUsers.deletedBy, deletedByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(websiteUsers)
        .where(whereClause),
    ]);

    return {
      data: users.map((u) => this.formatUser(u)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    return this.formatUser(user);
  }

  async create(dto: CreateWebsiteUserDto, createdBy?: string) {
    const existing = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.email, dto.email))
      .limit(1);

    if (existing.length > 0)
      throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await this.drizzle.db
      .insert(websiteUsers)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        isActive: true,
        createdBy: createdBy,
      })
      .returning();

    return this.formatUser(user);
  }

  async update(id: string, dto: UpdateWebsiteUserDto) {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (user.deletedAt)
      throw new BadRequestException('Cannot update a deleted user');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.drizzle.db
        .select()
        .from(websiteUsers)
        .where(eq(websiteUsers.email, dto.email))
        .limit(1);
      if (existing.length > 0)
        throw new ConflictException('Email already in use');
    }

    await this.drizzle.db
      .update(websiteUsers)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(websiteUsers.id, id));

    return this.findOne(id);
  }

  async softDelete(id: string, reason: string, deletedBy?: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (user.deletedAt)
      throw new BadRequestException('User is already deleted');

    await this.drizzle.db
      .update(websiteUsers)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedBy,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(websiteUsers.id, id));

    return { message: 'User deleted' };
  }

  async hardDelete(id: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (!user.deletedAt)
      throw new BadRequestException(
        'User must be soft-deleted before permanent deletion',
      );

    await this.drizzle.db.delete(websiteUsers).where(eq(websiteUsers.id, id));

    return { message: 'User permanently deleted' };
  }

  async restore(id: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    if (!user.deletedAt) throw new BadRequestException('User is not deleted');

    await this.drizzle.db
      .update(websiteUsers)
      .set({
        deletedAt: null,
        deletedReason: null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(websiteUsers.id, id));

    return { message: 'User restored' };
  }

  private formatUser(user: {
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
    };
  }
}
