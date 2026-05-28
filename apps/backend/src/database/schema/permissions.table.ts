import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  label: varchar('label', { length: 255 }),
  resource: varchar('resource', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type PermissionRow = typeof permissions.$inferSelect;
export type NewPermissionRow = typeof permissions.$inferInsert;
