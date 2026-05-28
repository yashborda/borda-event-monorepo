import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const magicLinkTokens = pgTable(
  'magic_link_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: text('token_hash').unique().notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    userType: varchar('user_type', { length: 10 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('magic_link_tokens_email_idx').on(t.email, t.userType)],
);

export type MagicLinkTokenRow = typeof magicLinkTokens.$inferSelect;
export type NewMagicLinkTokenRow = typeof magicLinkTokens.$inferInsert;
