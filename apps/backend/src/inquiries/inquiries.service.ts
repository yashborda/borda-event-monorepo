import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { catalogues } from '../database/schema/catalogues.table.js';
import { customers } from '../database/schema/customers.table.js';
import { inquiries } from '../database/schema/inquiries.table.js';
import { inquiryStatusEnum } from '../database/schema/event-enums.js';

type InquiryStatus = (typeof inquiryStatusEnum.enumValues)[number];

@Injectable()
export class InquiriesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll(
    page = 1,
    limit = 20,
    status?: string,
    catalogueId?: string,
  ) {
    const offset = (page - 1) * limit;

    const conditions = [];

    if (
      status &&
      (inquiryStatusEnum.enumValues as readonly string[]).includes(status)
    ) {
      conditions.push(eq(inquiries.status, status as InquiryStatus));
    }

    if (catalogueId) {
      conditions.push(eq(inquiries.catalogueId, catalogueId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: inquiries.id,
          name: inquiries.name,
          phone: inquiries.phone,
          email: inquiries.email,
          service: inquiries.service,
          message: inquiries.message,
          eventDate: inquiries.eventDate,
          status: inquiries.status,
          catalogueId: inquiries.catalogueId,
          catalogueTitle: catalogues.title,
          customerId: inquiries.customerId,
          customerName: customers.fullName,
          createdAt: inquiries.createdAt,
        })
        .from(inquiries)
        .leftJoin(catalogues, eq(inquiries.catalogueId, catalogues.id))
        .leftJoin(customers, eq(inquiries.customerId, customers.id))
        .where(whereClause)
        .orderBy(desc(inquiries.createdAt))
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(inquiries)
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
    const [row] = await this.drizzle.db
      .select({
        id: inquiries.id,
        name: inquiries.name,
        phone: inquiries.phone,
        email: inquiries.email,
        service: inquiries.service,
        message: inquiries.message,
        eventDate: inquiries.eventDate,
        status: inquiries.status,
        catalogueId: inquiries.catalogueId,
        catalogueTitle: catalogues.title,
        catalogueSlug: catalogues.slug,
        customerId: inquiries.customerId,
        customerName: customers.fullName,
        customerPhone: customers.phone,
        createdAt: inquiries.createdAt,
      })
      .from(inquiries)
      .leftJoin(catalogues, eq(inquiries.catalogueId, catalogues.id))
      .leftJoin(customers, eq(inquiries.customerId, customers.id))
      .where(eq(inquiries.id, id))
      .limit(1);

    if (!row) throw new NotFoundException('Inquiry not found');
    return row;
  }

  async updateStatus(id: string, status: InquiryStatus) {
    const [existing] = await this.drizzle.db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Inquiry not found');

    await this.drizzle.db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id));

    return this.findOne(id);
  }

  async linkCustomer(id: string, customerId: string | null) {
    const [existing] = await this.drizzle.db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Inquiry not found');

    if (customerId) {
      const [customer] = await this.drizzle.db
        .select({ id: customers.id, deletedAt: customers.deletedAt })
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      if (!customer) throw new BadRequestException('Customer not found');
      if (customer.deletedAt)
        throw new BadRequestException('Cannot link a deleted customer');
    }

    await this.drizzle.db
      .update(inquiries)
      .set({ customerId })
      .where(eq(inquiries.id, id));

    return this.findOne(id);
  }
}
