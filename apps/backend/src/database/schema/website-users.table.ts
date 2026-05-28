import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { adminUsers } from './admin-users.table.js';

export const websiteUsers = pgTable('website_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  passwordHash: text('password_hash'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedReason: text('deleted_reason'),
  createdBy: uuid('created_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
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

export type WebsiteUserRow = typeof websiteUsers.$inferSelect;
export type NewWebsiteUserRow = typeof websiteUsers.$inferInsert;
