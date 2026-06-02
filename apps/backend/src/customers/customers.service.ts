import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { bills } from '../database/schema/bills.table.js';
import { customers } from '../database/schema/customers.table.js';
import type { CreateCustomerDto } from './dto/create-customer.dto.js';
import type { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'updatedAt',
    sortDir: 'asc' | 'desc' = 'desc',
    includeDeleted = false,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'fullName'
        ? customers.fullName
        : sortBy === 'phone'
          ? customers.phone
          : sortBy === 'createdAt'
            ? customers.createdAt
            : sortBy === 'deletedAt'
              ? customers.deletedAt
              : customers.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(customers.deletedAt));
    } else {
      conditions.push(isNotNull(customers.deletedAt));
    }

    if (search) {
      conditions.push(
        or(
          ilike(customers.fullName, `%${search}%`),
          ilike(customers.phone, `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');

    const billsCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM bills
      WHERE bills.customer_id = ${customers.id}
        AND bills.deleted_at IS NULL
    )`;

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: customers.id,
          fullName: customers.fullName,
          phone: customers.phone,
          email: customers.email,
          address: customers.address,
          createdBy: customers.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: customers.deletedAt,
          deletedReason: customers.deletedReason,
          deletedBy: customers.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: customers.createdAt,
          updatedAt: customers.updatedAt,
          billsCount: billsCountSubquery,
        })
        .from(customers)
        .leftJoin(createdByUser, eq(customers.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(customers.deletedBy, deletedByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(customers)
        .where(whereClause),
    ]);

    return {
      data: rows,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');

    const billsCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM bills
      WHERE bills.customer_id = ${customers.id}
        AND bills.deleted_at IS NULL
    )`;

    const [c] = await this.drizzle.db
      .select({
        id: customers.id,
        fullName: customers.fullName,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        createdBy: customers.createdBy,
        createdByName: createdByUser.fullName,
        deletedAt: customers.deletedAt,
        deletedReason: customers.deletedReason,
        deletedBy: customers.deletedBy,
        deletedByName: deletedByUser.fullName,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        billsCount: billsCountSubquery,
      })
      .from(customers)
      .leftJoin(createdByUser, eq(customers.createdBy, createdByUser.id))
      .leftJoin(deletedByUser, eq(customers.deletedBy, deletedByUser.id))
      .where(eq(customers.id, id))
      .limit(1);

    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  /**
   * Quick lookup by exact phone (e.g. when creating a bill).
   * Returns the active customer or `null` when none exists — it does NOT throw,
   * so the caller can branch into "create new customer" without catching a 404.
   */
  async findByPhone(phone: string) {
    if (!phone)
      throw new BadRequestException('phone query parameter is required');

    const createdByUser = alias(adminUsers, 'created_by_user');

    const [c] = await this.drizzle.db
      .select({
        id: customers.id,
        fullName: customers.fullName,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        createdBy: customers.createdBy,
        createdByName: createdByUser.fullName,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
      })
      .from(customers)
      .leftJoin(createdByUser, eq(customers.createdBy, createdByUser.id))
      .where(and(eq(customers.phone, phone), isNull(customers.deletedAt)))
      .limit(1);

    return c ?? null;
  }

  async create(dto: CreateCustomerDto, createdById?: string) {
    // The phone UNIQUE constraint covers soft-deleted rows too, so check across
    // all customers and surface a clear message instead of a raw DB violation.
    const [existingPhone] = await this.drizzle.db
      .select()
      .from(customers)
      .where(eq(customers.phone, dto.phone))
      .limit(1);

    if (existingPhone) {
      if (existingPhone.deletedAt)
        throw new ConflictException(
          `A deleted customer with phone ${dto.phone} already exists — restore it instead`,
        );
      throw new ConflictException(
        `A customer with phone ${dto.phone} already exists`,
      );
    }

    const [customer] = await this.drizzle.db
      .insert(customers)
      .values({
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        createdBy: createdById,
      })
      .returning();

    return this.findOne(customer.id);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Customer not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted customer');

    if (dto.phone && dto.phone !== existing.phone) {
      const [phoneConflict] = await this.drizzle.db
        .select()
        .from(customers)
        .where(and(eq(customers.phone, dto.phone), ne(customers.id, id)))
        .limit(1);

      if (phoneConflict)
        throw new ConflictException(
          `A customer with phone ${dto.phone} already exists`,
        );
    }

    await this.drizzle.db
      .update(customers)
      .set({
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id));

    return this.findOne(id);
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [customer] = await this.drizzle.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.deletedAt)
      throw new BadRequestException('Customer is already deleted');

    await this.drizzle.db
      .update(customers)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id));

    return { message: 'Customer deleted' };
  }

  async restore(id: string) {
    const [customer] = await this.drizzle.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!customer.deletedAt)
      throw new BadRequestException('Customer is not deleted');

    await this.drizzle.db
      .update(customers)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id));

    return { message: 'Customer restored' };
  }

  async permanentDelete(id: string) {
    const [customer] = await this.drizzle.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!customer.deletedAt)
      throw new BadRequestException(
        'Customer must be soft-deleted before permanent deletion',
      );

    // bills.customer_id is NOT NULL + ON DELETE restrict, so a customer with any
    // bills cannot be hard-deleted. Check first and return a clear error rather
    // than letting Postgres raise a foreign-key violation.
    const [{ billCount }] = await this.drizzle.db
      .select({ billCount: count() })
      .from(bills)
      .where(eq(bills.customerId, id));

    if (billCount > 0)
      throw new BadRequestException(
        `Cannot permanently delete a customer with ${billCount} bill(s) on record`,
      );

    await this.drizzle.db.delete(customers).where(eq(customers.id, id));
    return { message: 'Customer permanently deleted' };
  }
}
