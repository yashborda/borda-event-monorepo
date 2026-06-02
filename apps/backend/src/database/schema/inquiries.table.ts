import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { catalogues } from './catalogues.table';
import { customers } from './customers.table';
import { inquiryStatusEnum } from './event-enums';

export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  catalogueId: uuid('catalogue_id').references(() => catalogues.id, {
    onDelete: 'set null',
  }),
  customerId: uuid('customer_id').references(() => customers.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  message: text('message'),
  eventDate: timestamp('event_date', { withTimezone: true }),
  status: inquiryStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type InquiryRow = typeof inquiries.$inferSelect;
export type NewInquiryRow = typeof inquiries.$inferInsert;
