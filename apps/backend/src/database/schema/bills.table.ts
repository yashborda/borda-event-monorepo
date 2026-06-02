import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { customers } from './customers.table';
import { billStatusEnum } from './event-enums';

export const bills = pgTable('bills', {
  id: uuid('id').primaryKey().defaultRandom(),
  billNo: varchar('bill_no', { length: 50 }).unique().notNull(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'restrict' }),
  bookingDate: timestamp('booking_date', { withTimezone: true }).notNull(),
  eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
  destinationAddr: text('destination_addr'),
  totalAmount: integer('total_amount').default(0).notNull(),
  advanceAmount: integer('advance_amount').default(0).notNull(),
  creditBalance: integer('credit_balance').default(0).notNull(),
  status: billStatusEnum('status').default('draft').notNull(),
  // Audit
  createdBy: uuid('created_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedReason: text('deleted_reason'),
  deletedBy: uuid('deleted_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type BillRow = typeof bills.$inferSelect;
export type NewBillRow = typeof bills.$inferInsert;
