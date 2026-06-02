/**
 * Idempotent services seed.
 * Run via: pnpm --filter backend seed:services
 *
 * Inserts the standard event-decoration services (is_active true,
 * incrementing sort_order, slug auto-generated from the name).
 * Idempotent: re-running skips services whose slug already exists.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { services } from '../schema/services.table';
import { generateSlug } from '../../common/utils/slug.util';

const SERVICE_NAMES = [
  'Engagement',
  'Baby Shower',
  'Bride & Groom Entry',
  'Birthday Celebration',
  'Festival Celebration',
  'Receptions',
  'DJ & Orchestra',
  'Haldi & Mehndi',
  'Anchor Male & Female',
  'Carnival',
  'Catering Services',
  'Dance Group',
  'Varmala',
  'Panjabi & Nashik Dhol',
  'Singer Booking',
  'Stool & Selfie Booth',
  'Vaidik Lagna Geet',
  'Panch Masi',
  'Cradle Ceremony',
  'Vanarasam',
  'Chhathi Pujan',
  'Kanku Pagla',
  'Mayra',
  'Vintage Car',
  'Ganesh Sthapan',
  'Gender Reveal',
  'Opening',
  'Home and Vastu',
  'Bride To Be',
];

export async function runServicesSeed(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Seeding services...');

  const values = SERVICE_NAMES.map((name, i) => ({
    name,
    slug: generateSlug(name),
    isActive: true,
    sortOrder: i + 1,
  }));

  const inserted = await db
    .insert(services)
    .values(values)
    .onConflictDoNothing({ target: services.slug })
    .returning();

  console.log(
    `     ${inserted.length} services inserted (${
      SERVICE_NAMES.length - inserted.length
    } already existed — skipped)`,
  );

  console.log('✅ Services seed complete!');
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
    await runServicesSeed(db);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Services seed failed:', err);
    process.exit(1);
  });
}
