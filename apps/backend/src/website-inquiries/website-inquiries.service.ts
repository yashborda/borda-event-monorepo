import { BadRequestException, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { catalogues } from '../database/schema/catalogues.table.js';
import { inquiries } from '../database/schema/inquiries.table.js';
import type { CreateInquiryDto } from '../inquiries/dto/create-inquiry.dto.js';

@Injectable()
export class WebsiteInquiriesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateInquiryDto) {
    // Validate the optional catalogue link so a bad id returns a clean 400
    // instead of a foreign-key violation.
    if (dto.catalogueId) {
      const [cat] = await this.drizzle.db
        .select({ id: catalogues.id })
        .from(catalogues)
        .where(
          and(
            eq(catalogues.id, dto.catalogueId),
            isNull(catalogues.deletedAt),
          ),
        )
        .limit(1);
      if (!cat) throw new BadRequestException('Catalogue not found');
    }

    // status defaults to 'new'; customer_id stays null (an admin links it later).
    const [created] = await this.drizzle.db
      .insert(inquiries)
      .values({
        name: dto.name,
        phone: dto.phone,
        message: dto.message,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
        catalogueId: dto.catalogueId ?? null,
      })
      .returning({
        id: inquiries.id,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
      });

    return {
      id: created.id,
      status: created.status,
      createdAt: created.createdAt,
      message: 'Inquiry submitted',
    };
  }
}
