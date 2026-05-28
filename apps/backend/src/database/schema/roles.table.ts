import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  isSystem: boolean('is_system').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type RoleRow = typeof roles.$inferSelect;
export type NewRoleRow = typeof roles.$inferInsert;
