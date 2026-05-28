import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: text('token_hash').unique().notNull(),
    userId: uuid('user_id').notNull(),
    userType: varchar('user_type', { length: 10 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('password_reset_tokens_user_idx').on(t.userId, t.userType)],
);

export type PasswordResetTokenRow = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetTokenRow = typeof passwordResetTokens.$inferInsert;
