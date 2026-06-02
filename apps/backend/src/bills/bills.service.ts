import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService, type DrizzleDB } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { billItems } from '../database/schema/bill-items.table.js';
import { bills } from '../database/schema/bills.table.js';
import { customers } from '../database/schema/customers.table.js';
import { services } from '../database/schema/services.table.js';
import { billStatusEnum } from '../database/schema/event-enums.js';
import type { CreateBillDto, BillItemDto } from './dto/create-bill.dto.js';
import type { UpdateBillDto } from './dto/update-bill.dto.js';

type Tx = Parameters<Parameters<DrizzleDB['transaction']>[0]>[0];
type BillStatus = (typeof billStatusEnum.enumValues)[number];

const BILL_NO_PREFIX = 'BE-';
const BILL_NO_PAD = 4;
// Fixed key used with pg_advisory_xact_lock to serialise bill-number generation
// across concurrent create requests for the lifetime of each transaction.
const BILL_NO_LOCK_KEY = 4815162342;

@Injectable()
export class BillsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll(
    page = 1,
    limit = 20,
    status?: string,
    customerId?: string,
    eventDateFrom?: string,
    eventDateTo?: string,
    includeDeleted = false,
    sortBy = 'updatedAt',
    sortDir: 'asc' | 'desc' = 'desc',
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'billNo'
        ? bills.billNo
        : sortBy === 'eventDate'
          ? bills.eventDate
          : sortBy === 'bookingDate'
            ? bills.bookingDate
            : sortBy === 'totalAmount'
              ? bills.totalAmount
              : sortBy === 'status'
                ? bills.status
                : sortBy === 'createdAt'
                  ? bills.createdAt
                  : sortBy === 'deletedAt'
                    ? bills.deletedAt
                    : bills.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(bills.deletedAt));
    } else {
      conditions.push(isNotNull(bills.deletedAt));
    }

    if (status && (billStatusEnum.enumValues as readonly string[]).includes(status)) {
      conditions.push(eq(bills.status, status as BillStatus));
    }

    if (customerId) {
      conditions.push(eq(bills.customerId, customerId));
    }

    if (eventDateFrom) {
      const from = new Date(eventDateFrom);
      if (Number.isNaN(from.getTime()))
        throw new BadRequestException('Invalid eventDateFrom');
      conditions.push(gte(bills.eventDate, from));
    }

    if (eventDateTo) {
      const to = new Date(eventDateTo);
      if (Number.isNaN(to.getTime()))
        throw new BadRequestException('Invalid eventDateTo');
      conditions.push(lte(bills.eventDate, to));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');

    const itemCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM bill_items
      WHERE bill_items.bill_id = ${bills.id}
    )`;

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: bills.id,
          billNo: bills.billNo,
          customerId: bills.customerId,
          customerName: customers.fullName,
          customerPhone: customers.phone,
          bookingDate: bills.bookingDate,
          eventDate: bills.eventDate,
          destinationAddr: bills.destinationAddr,
          totalAmount: bills.totalAmount,
          advanceAmount: bills.advanceAmount,
          creditBalance: bills.creditBalance,
          status: bills.status,
          createdBy: bills.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: bills.deletedAt,
          deletedReason: bills.deletedReason,
          deletedBy: bills.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: bills.createdAt,
          updatedAt: bills.updatedAt,
          itemCount: itemCountSubquery,
        })
        .from(bills)
        .leftJoin(customers, eq(bills.customerId, customers.id))
        .leftJoin(createdByUser, eq(bills.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(bills.deletedBy, deletedByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db.select({ total: count() }).from(bills).where(whereClause),
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

    const [b] = await this.drizzle.db
      .select({
        id: bills.id,
        billNo: bills.billNo,
        customerId: bills.customerId,
        customerName: customers.fullName,
        customerPhone: customers.phone,
        customerEmail: customers.email,
        customerAddress: customers.address,
        bookingDate: bills.bookingDate,
        eventDate: bills.eventDate,
        destinationAddr: bills.destinationAddr,
        totalAmount: bills.totalAmount,
        advanceAmount: bills.advanceAmount,
        creditBalance: bills.creditBalance,
        status: bills.status,
        createdBy: bills.createdBy,
        createdByName: createdByUser.fullName,
        deletedAt: bills.deletedAt,
        deletedReason: bills.deletedReason,
        deletedBy: bills.deletedBy,
        deletedByName: deletedByUser.fullName,
        createdAt: bills.createdAt,
        updatedAt: bills.updatedAt,
      })
      .from(bills)
      .leftJoin(customers, eq(bills.customerId, customers.id))
      .leftJoin(createdByUser, eq(bills.createdBy, createdByUser.id))
      .leftJoin(deletedByUser, eq(bills.deletedBy, deletedByUser.id))
      .where(eq(bills.id, id))
      .limit(1);

    if (!b) throw new NotFoundException('Bill not found');

    const items = await this.fetchBillItems(id);

    return {
      id: b.id,
      billNo: b.billNo,
      customer: {
        id: b.customerId,
        fullName: b.customerName,
        phone: b.customerPhone,
        email: b.customerEmail,
        address: b.customerAddress,
      },
      bookingDate: b.bookingDate,
      eventDate: b.eventDate,
      destinationAddr: b.destinationAddr,
      totalAmount: b.totalAmount,
      advanceAmount: b.advanceAmount,
      creditBalance: b.creditBalance,
      status: b.status,
      createdBy: b.createdBy,
      createdByName: b.createdByName,
      deletedAt: b.deletedAt,
      deletedReason: b.deletedReason,
      deletedBy: b.deletedBy,
      deletedByName: b.deletedByName,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      items,
    };
  }

  async create(dto: CreateBillDto, createdById?: string) {
    const advanceAmount = dto.advanceAmount ?? 0;

    // Financial invariants — validated server-side, never trusting the client.
    this.assertTotalsMatch(
      dto.totalAmount,
      dto.items.map((i) => i.amount),
    );
    this.assertAdvanceWithinTotal(advanceAmount, dto.totalAmount);
    const creditBalance = dto.totalAmount - advanceAmount;

    const billId = await this.drizzle.db.transaction(async (tx) => {
      await this.assertActiveCustomer(tx, dto.customerId);
      await this.assertServicesExist(tx, dto.items);

      const billNo = await this.nextBillNo(tx);

      const [bill] = await tx
        .insert(bills)
        .values({
          billNo,
          customerId: dto.customerId,
          bookingDate: dto.bookingDate ? new Date(dto.bookingDate) : new Date(),
          eventDate: new Date(dto.eventDate),
          destinationAddr: dto.destinationAddr,
          totalAmount: dto.totalAmount,
          advanceAmount,
          creditBalance,
          status: dto.status ?? 'draft',
          createdBy: createdById,
        })
        .returning({ id: bills.id });

      await tx.insert(billItems).values(
        dto.items.map((it, idx) => ({
          billId: bill.id,
          serviceId: it.serviceId ?? null,
          description: it.description,
          qty: it.qty,
          amount: it.amount,
          sortOrder: it.sortOrder ?? idx,
        })),
      );

      return bill.id;
    });

    return this.findOne(billId);
  }

  async update(id: string, dto: UpdateBillDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(bills)
      .where(eq(bills.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Bill not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted bill');

    await this.drizzle.db.transaction(async (tx) => {
      if (dto.customerId && dto.customerId !== existing.customerId) {
        await this.assertActiveCustomer(tx, dto.customerId);
      }

      // Determine the effective item amounts (new items, or the existing ones
      // if items aren't being replaced) so the total can always be re-validated.
      let itemAmounts: number[];
      if (dto.items) {
        await this.assertServicesExist(tx, dto.items);
        itemAmounts = dto.items.map((i) => i.amount);
      } else {
        const existingItems = await tx
          .select({ amount: billItems.amount })
          .from(billItems)
          .where(eq(billItems.billId, id));
        itemAmounts = existingItems.map((i) => i.amount);
      }

      const effectiveTotal = dto.totalAmount ?? existing.totalAmount;
      const effectiveAdvance = dto.advanceAmount ?? existing.advanceAmount;
      this.assertTotalsMatch(effectiveTotal, itemAmounts);
      this.assertAdvanceWithinTotal(effectiveAdvance, effectiveTotal);
      const creditBalance = effectiveTotal - effectiveAdvance;

      await tx
        .update(bills)
        .set({
          ...(dto.customerId !== undefined && { customerId: dto.customerId }),
          ...(dto.bookingDate !== undefined && {
            bookingDate: new Date(dto.bookingDate),
          }),
          ...(dto.eventDate !== undefined && {
            eventDate: new Date(dto.eventDate),
          }),
          ...(dto.destinationAddr !== undefined && {
            destinationAddr: dto.destinationAddr,
          }),
          totalAmount: effectiveTotal,
          advanceAmount: effectiveAdvance,
          creditBalance,
          updatedAt: new Date(),
        })
        .where(eq(bills.id, id));

      if (dto.items) {
        await tx.delete(billItems).where(eq(billItems.billId, id));
        await tx.insert(billItems).values(
          dto.items.map((it, idx) => ({
            billId: id,
            serviceId: it.serviceId ?? null,
            description: it.description,
            qty: it.qty,
            amount: it.amount,
            sortOrder: it.sortOrder ?? idx,
          })),
        );
      }
    });

    return this.findOne(id);
  }

  async updateStatus(id: string, status: BillStatus) {
    const [bill] = await this.drizzle.db
      .select()
      .from(bills)
      .where(eq(bills.id, id))
      .limit(1);

    if (!bill) throw new NotFoundException('Bill not found');
    if (bill.deletedAt)
      throw new BadRequestException('Cannot change status of a deleted bill');

    await this.drizzle.db
      .update(bills)
      .set({ status, updatedAt: new Date() })
      .where(eq(bills.id, id));

    return this.findOne(id);
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [bill] = await this.drizzle.db
      .select()
      .from(bills)
      .where(eq(bills.id, id))
      .limit(1);

    if (!bill) throw new NotFoundException('Bill not found');
    if (bill.deletedAt)
      throw new BadRequestException('Bill is already deleted');

    await this.drizzle.db
      .update(bills)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(bills.id, id));

    return { message: 'Bill deleted' };
  }

  async restore(id: string) {
    const [bill] = await this.drizzle.db
      .select()
      .from(bills)
      .where(eq(bills.id, id))
      .limit(1);

    if (!bill) throw new NotFoundException('Bill not found');
    if (!bill.deletedAt)
      throw new BadRequestException('Bill is not deleted');

    await this.drizzle.db
      .update(bills)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(bills.id, id));

    return { message: 'Bill restored' };
  }

  async permanentDelete(id: string) {
    const [bill] = await this.drizzle.db
      .select()
      .from(bills)
      .where(eq(bills.id, id))
      .limit(1);

    if (!bill) throw new NotFoundException('Bill not found');
    if (!bill.deletedAt)
      throw new BadRequestException(
        'Bill must be soft-deleted before permanent deletion',
      );

    // bill_items are removed automatically via ON DELETE cascade.
    await this.drizzle.db.delete(bills).where(eq(bills.id, id));
    return { message: 'Bill permanently deleted' };
  }

  // ── Helpers ────────────────────────────────────────────────
  private assertTotalsMatch(totalAmount: number, itemAmounts: number[]) {
    const sum = itemAmounts.reduce((acc, a) => acc + a, 0);
    if (sum !== totalAmount)
      throw new BadRequestException(
        `total_amount (${totalAmount}) must equal the sum of item amounts (${sum})`,
      );
  }

  private assertAdvanceWithinTotal(advanceAmount: number, totalAmount: number) {
    if (advanceAmount > totalAmount)
      throw new BadRequestException(
        `advance_amount (${advanceAmount}) cannot exceed total_amount (${totalAmount})`,
      );
  }

  private async assertActiveCustomer(tx: Tx, customerId: string) {
    const [customer] = await tx
      .select({ id: customers.id, deletedAt: customers.deletedAt })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) throw new BadRequestException('Customer not found');
    if (customer.deletedAt)
      throw new BadRequestException('Cannot bill a deleted customer');
  }

  private async assertServicesExist(tx: Tx, items: BillItemDto[]) {
    const ids = [
      ...new Set(
        items
          .map((i) => i.serviceId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    if (ids.length === 0) return;

    const found = await tx
      .select({ id: services.id })
      .from(services)
      .where(inArray(services.id, ids));
    const foundIds = new Set(found.map((f) => f.id));

    for (const id of ids) {
      if (!foundIds.has(id))
        throw new BadRequestException(`Service ${id} not found`);
    }
  }

  private async nextBillNo(tx: Tx): Promise<string> {
    // Serialise number generation for the duration of this transaction so two
    // concurrent creates can never read the same max and collide on bill_no.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${BILL_NO_LOCK_KEY})`);

    // SUBSTRING(bill_no FROM 4) strips the "BE-" prefix; cast the rest to int so
    // ordering is numeric (robust beyond 9999 / variable padding).
    const [{ maxSeq }] = await tx
      .select({
        maxSeq: sql<number>`COALESCE(MAX(CAST(SUBSTRING(${bills.billNo} FROM 4) AS INTEGER)), 0)::int`,
      })
      .from(bills);

    return `${BILL_NO_PREFIX}${String(maxSeq + 1).padStart(BILL_NO_PAD, '0')}`;
  }

  private async fetchBillItems(billId: string) {
    return this.drizzle.db
      .select({
        id: billItems.id,
        serviceId: billItems.serviceId,
        serviceName: services.name,
        description: billItems.description,
        qty: billItems.qty,
        amount: billItems.amount,
        sortOrder: billItems.sortOrder,
      })
      .from(billItems)
      .leftJoin(services, eq(billItems.serviceId, services.id))
      .where(eq(billItems.billId, billId))
      .orderBy(asc(billItems.sortOrder));
  }
}
