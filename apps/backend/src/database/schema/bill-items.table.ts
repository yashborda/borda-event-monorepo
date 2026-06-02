import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { bills } from './bills.table';
import { services } from './services.table';

export const billItems = pgTable('bill_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  billId: uuid('bill_id')
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').references(() => services.id, {
    onDelete: 'set null',
  }),
  description: text('description').notNull(),
  qty: integer('qty').default(1).notNull(),
  amount: integer('amount').default(0).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export type BillItemRow = typeof billItems.$inferSelect;
export type NewBillItemRow = typeof billItems.$inferInsert;
