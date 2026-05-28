import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { permissions } from './permissions.table';

export const adminUserPermissions = pgTable(
  'admin_user_permissions',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    grantedAt: timestamp('granted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    grantedBy: uuid('granted_by').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.permissionId] })],
);

export type AdminUserPermissionRow = typeof adminUserPermissions.$inferSelect;
