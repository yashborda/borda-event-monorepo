/**
 * Idempotent seed script.
 * Run via: pnpm --filter backend seed
 *
 * Creates:
 *   - All system permissions (26 total)
 *   - System role: Super Admin (all permissions)
 *   - Default admin user: admin@admin.com / password
 */

import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

import { IPermissionName } from '@pkg/types';

import { adminUserRoles } from '../schema/admin-user-roles.table';
import { adminUsers } from '../schema/admin-users.table';
import { permissions } from '../schema/permissions.table';
import { rolePermissions } from '../schema/role-permissions.table';
import { roles } from '../schema/roles.table';

const SYSTEM_PERMISSIONS: Array<{
  slug: IPermissionName;
  label: string;
  resource: string;
  action: string;
  description: string;
}> = [
  {
    slug: 'users:read',
    label: 'Read Users',
    resource: 'users',
    action: 'read',
    description: 'View admin users',
  },
  {
    slug: 'users:create',
    label: 'Create Users',
    resource: 'users',
    action: 'create',
    description: 'Create admin users',
  },
  {
    slug: 'users:update',
    label: 'Update Users',
    resource: 'users',
    action: 'update',
    description: 'Update admin users and their roles/permissions',
  },
  {
    slug: 'users:delete',
    label: 'Delete Users',
    resource: 'users',
    action: 'delete',
    description: 'Deactivate admin users',
  },
  {
    slug: 'roles:read',
    label: 'Read Roles',
    resource: 'roles',
    action: 'read',
    description: 'View roles',
  },
  {
    slug: 'roles:create',
    label: 'Create Roles',
    resource: 'roles',
    action: 'create',
    description: 'Create new roles',
  },
  {
    slug: 'roles:update',
    label: 'Update Roles',
    resource: 'roles',
    action: 'update',
    description: 'Update roles and their permissions',
  },
  {
    slug: 'roles:delete',
    label: 'Delete Roles',
    resource: 'roles',
    action: 'delete',
    description: 'Delete custom roles',
  },
  {
    slug: 'permissions:read',
    label: 'Read Permissions',
    resource: 'permissions',
    action: 'read',
    description: 'View system permissions',
  },
  {
    slug: 'website-users:read',
    label: 'Read Website Users',
    resource: 'website-users',
    action: 'read',
    description: 'View website users',
  },
  {
    slug: 'website-users:create',
    label: 'Create Website Users',
    resource: 'website-users',
    action: 'create',
    description: 'Create website users',
  },
  {
    slug: 'website-users:update',
    label: 'Update Website Users',
    resource: 'website-users',
    action: 'update',
    description: 'Update website users',
  },
  {
    slug: 'website-users:delete',
    label: 'Delete Website Users',
    resource: 'website-users',
    action: 'delete',
    description: 'Soft delete website users',
  },
  // Blog Categories permissions
  {
    slug: 'blog-categories:read',
    label: 'Read Blog Categories',
    resource: 'blog-categories',
    action: 'read',
    description: 'View blog categories',
  },
  {
    slug: 'blog-categories:create',
    label: 'Create Blog Categories',
    resource: 'blog-categories',
    action: 'create',
    description: 'Create blog categories',
  },
  {
    slug: 'blog-categories:update',
    label: 'Update Blog Categories',
    resource: 'blog-categories',
    action: 'update',
    description: 'Update blog categories',
  },
  {
    slug: 'blog-categories:delete',
    label: 'Delete Blog Categories',
    resource: 'blog-categories',
    action: 'delete',
    description: 'Delete blog categories',
  },
  // Blog Authors permissions
  {
    slug: 'blog-authors:read',
    label: 'Read Blog Authors',
    resource: 'blog-authors',
    action: 'read',
    description: 'View blog authors',
  },
  {
    slug: 'blog-authors:create',
    label: 'Create Blog Authors',
    resource: 'blog-authors',
    action: 'create',
    description: 'Create blog authors',
  },
  {
    slug: 'blog-authors:update',
    label: 'Update Blog Authors',
    resource: 'blog-authors',
    action: 'update',
    description: 'Update blog authors',
  },
  {
    slug: 'blog-authors:delete',
    label: 'Delete Blog Authors',
    resource: 'blog-authors',
    action: 'delete',
    description: 'Soft delete and restore blog authors',
  },
  // Blog Tags permissions
  {
    slug: 'blog-tags:read',
    label: 'Read Blog Tags',
    resource: 'blog-tags',
    action: 'read',
    description: 'View blog tags',
  },
  {
    slug: 'blog-tags:create',
    label: 'Create Blog Tags',
    resource: 'blog-tags',
    action: 'create',
    description: 'Create blog tags',
  },
  {
    slug: 'blog-tags:update',
    label: 'Update Blog Tags',
    resource: 'blog-tags',
    action: 'update',
    description: 'Update blog tags',
  },
  {
    slug: 'blog-tags:delete',
    label: 'Delete Blog Tags',
    resource: 'blog-tags',
    action: 'delete',
    description: 'Soft delete and restore blog tags',
  },
  // Blogs permissions
  {
    slug: 'blogs:read',
    label: 'Read Blogs',
    resource: 'blogs',
    action: 'read',
    description: 'View blog posts',
  },
  {
    slug: 'blogs:create',
    label: 'Create Blogs',
    resource: 'blogs',
    action: 'create',
    description: 'Create blog posts',
  },
  {
    slug: 'blogs:update',
    label: 'Update Blogs',
    resource: 'blogs',
    action: 'update',
    description: 'Update blog posts',
  },
  {
    slug: 'blogs:delete',
    label: 'Delete Blogs',
    resource: 'blogs',
    action: 'delete',
    description: 'Soft delete and restore blog posts',
  },
  {
    slug: 'blogs:publish',
    label: 'Publish Blogs',
    resource: 'blogs',
    action: 'publish',
    description: 'Publish or schedule blog posts',
  },
  {
    slug: 'blogs:revalidate',
    label: 'Sync Blogs',
    resource: 'blogs',
    action: 'revalidate',
    description: 'Manually sync blog post cache to the website',
  },
  {
    slug: 'blog-categories:revalidate',
    label: 'Sync Blog Categories',
    resource: 'blog-categories',
    action: 'revalidate',
    description: 'Manually sync blog category cache to the website',
  },
  {
    slug: 'blog-tags:revalidate',
    label: 'Sync Blog Tags',
    resource: 'blog-tags',
    action: 'revalidate',
    description: 'Manually sync blog tag cache to the website',
  },
  {
    slug: 'blog-authors:revalidate',
    label: 'Sync Blog Authors',
    resource: 'blog-authors',
    action: 'revalidate',
    description: 'Manually sync blog author cache to the website',
  },
  // Services permissions
  {
    slug: 'services:read',
    label: 'Read Services',
    resource: 'services',
    action: 'read',
    description: 'View services',
  },
  {
    slug: 'services:create',
    label: 'Create Services',
    resource: 'services',
    action: 'create',
    description: 'Create services',
  },
  {
    slug: 'services:update',
    label: 'Update Services',
    resource: 'services',
    action: 'update',
    description: 'Update services and attach/detach/reorder their media',
  },
  {
    slug: 'services:delete',
    label: 'Delete Services',
    resource: 'services',
    action: 'delete',
    description: 'Soft delete, restore, and permanently delete services',
  },
  // Customers permissions
  {
    slug: 'customers:read',
    label: 'Read Customers',
    resource: 'customers',
    action: 'read',
    description: 'View customers and look them up by phone',
  },
  {
    slug: 'customers:create',
    label: 'Create Customers',
    resource: 'customers',
    action: 'create',
    description: 'Create customers',
  },
  {
    slug: 'customers:update',
    label: 'Update Customers',
    resource: 'customers',
    action: 'update',
    description: 'Update customers',
  },
  {
    slug: 'customers:delete',
    label: 'Delete Customers',
    resource: 'customers',
    action: 'delete',
    description: 'Soft delete, restore, and permanently delete customers',
  },
  // Bills permissions
  {
    slug: 'bills:read',
    label: 'Read Bills',
    resource: 'bills',
    action: 'read',
    description: 'View bills and bill items',
  },
  {
    slug: 'bills:create',
    label: 'Create Bills',
    resource: 'bills',
    action: 'create',
    description: 'Create bills with line items',
  },
  {
    slug: 'bills:update',
    label: 'Update Bills',
    resource: 'bills',
    action: 'update',
    description: 'Update bills, their items, and status',
  },
  {
    slug: 'bills:delete',
    label: 'Delete Bills',
    resource: 'bills',
    action: 'delete',
    description: 'Soft delete, restore, and permanently delete bills',
  },
  // Catalogues permissions
  {
    slug: 'catalogues:read',
    label: 'Read Catalogues',
    resource: 'catalogues',
    action: 'read',
    description: 'View catalogues and their services',
  },
  {
    slug: 'catalogues:create',
    label: 'Create Catalogues',
    resource: 'catalogues',
    action: 'create',
    description: 'Create catalogues',
  },
  {
    slug: 'catalogues:update',
    label: 'Update Catalogues',
    resource: 'catalogues',
    action: 'update',
    description: 'Update catalogues and attach/detach/reorder their services',
  },
  {
    slug: 'catalogues:delete',
    label: 'Delete Catalogues',
    resource: 'catalogues',
    action: 'delete',
    description: 'Soft delete, restore, and permanently delete catalogues',
  },
  // Inquiries permissions (create is public; there is no delete)
  {
    slug: 'inquiries:read',
    label: 'Read Inquiries',
    resource: 'inquiries',
    action: 'read',
    description: 'View inquiries submitted from the website',
  },
  {
    slug: 'inquiries:update',
    label: 'Update Inquiries',
    resource: 'inquiries',
    action: 'update',
    description: 'Update inquiry status and link inquiries to customers',
  },
  // Social posts permissions
  {
    slug: 'social-posts:read',
    label: 'Read Social Posts',
    resource: 'social-posts',
    action: 'read',
    description: 'View social posts',
  },
  {
    slug: 'social-posts:create',
    label: 'Create Social Posts',
    resource: 'social-posts',
    action: 'create',
    description: 'Create social posts',
  },
  {
    slug: 'social-posts:update',
    label: 'Update Social Posts',
    resource: 'social-posts',
    action: 'update',
    description: 'Update and reorder social posts',
  },
  {
    slug: 'social-posts:delete',
    label: 'Delete Social Posts',
    resource: 'social-posts',
    action: 'delete',
    description: 'Permanently delete social posts',
  },
  // Service videos permissions
  {
    slug: 'service-videos:read',
    label: 'Read Service Videos',
    resource: 'service-videos',
    action: 'read',
    description: 'View service videos',
  },
  {
    slug: 'service-videos:create',
    label: 'Create Service Videos',
    resource: 'service-videos',
    action: 'create',
    description: 'Create service videos',
  },
  {
    slug: 'service-videos:update',
    label: 'Update Service Videos',
    resource: 'service-videos',
    action: 'update',
    description: 'Update and reorder service videos',
  },
  {
    slug: 'service-videos:delete',
    label: 'Delete Service Videos',
    resource: 'service-videos',
    action: 'delete',
    description: 'Delete service videos',
  },
];

export async function runSeed(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Starting seed...');

  // 1. Upsert all system permissions
  console.log('  → Seeding permissions...');
  const insertedPermissions = await db
    .insert(permissions)
    .values(SYSTEM_PERMISSIONS)
    .onConflictDoUpdate({
      target: permissions.slug,
      set: {
        label: sql<string>`excluded.label`,
        description: sql<string>`excluded.description`,
      },
    })
    .returning();

  console.log(`     ${insertedPermissions.length} permissions upserted`);

  // Re-fetch all permissions to get their IDs (needed even if already existed)
  const allPermissions = await db.select().from(permissions);

  // 2. Upsert system roles
  console.log('  → Seeding roles...');
  const [superAdminRole] = await db
    .insert(roles)
    .values({
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full system access',
      isSystem: true,
    })
    .onConflictDoNothing()
    .returning();

  // Re-fetch if already existed
  const allRoles = await db.select().from(roles);
  const superAdmin =
    superAdminRole ?? allRoles.find((r) => r.slug === 'super_admin')!;

  // 3. Assign all permissions to Super Admin role
  console.log('  → Assigning permissions to Super Admin role...');
  const superAdminPerms = allPermissions.map((p) => ({
    roleId: superAdmin.id,
    permissionId: p.id,
  }));
  await db
    .insert(rolePermissions)
    .values(superAdminPerms)
    .onConflictDoNothing();

  // 4. Create default super admin user
  console.log('  → Creating default admin user (admin@admin.com)...');
  const passwordHash = await bcrypt.hash('password', 12);

  const [defaultUser] = await db
    .insert(adminUsers)
    .values({
      email: 'admin@admin.com',
      fullName: 'Super Admin',
      passwordHash,
      emailVerified: true,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (defaultUser) {
    await db
      .insert(adminUserRoles)
      .values({ userId: defaultUser.id, roleId: superAdmin.id })
      .onConflictDoNothing();
    console.log(
      '     Default admin user created and assigned Super Admin role',
    );
  } else {
    console.log('     Default admin user already exists — skipped');
  }

  console.log('✅ Seed complete!');
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME,
  });
  const db = drizzle(pool);
  try {
    await runSeed(db);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
