import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { permissions } from './permissions.table';
import { roles } from './roles.table';

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    grantedAt: timestamp('granted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export type RolePermissionRow = typeof rolePermissions.$inferSelect;
