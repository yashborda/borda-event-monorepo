import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { roles } from './roles.table';

export const adminUserRoles = pgTable(
  'admin_user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    assignedBy: uuid('assigned_by').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

export type AdminUserRoleRow = typeof adminUserRoles.$inferSelect;
