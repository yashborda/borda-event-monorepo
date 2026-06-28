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
  // Phone OR email is required (enforced at the API/DTO layer); both nullable
  // here so either can be the sole contact method.
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  // Service the visitor picked on the website enquiry form (free-text name).
  service: varchar('service', { length: 255 }),
  message: text('message'),
  eventDate: timestamp('event_date', { withTimezone: true }),
  status: inquiryStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type InquiryRow = typeof inquiries.$inferSelect;
export type NewInquiryRow = typeof inquiries.$inferInsert;
