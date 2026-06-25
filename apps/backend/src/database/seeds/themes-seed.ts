/**
 * Idempotent default-themes seed.
 * Run via: pnpm --filter backend seed:themes
 *
 * For every service, tops up its theme list to DEFAULT_THEME_COUNT (100) empty
 * placeholder themes named `<first-slug-word>-theme-NN` — matching the admin
 * "Add Theme" convention. Idempotent: a service already at/over 100 is skipped;
 * a partially-themed service gets only the missing themes.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';

import { serviceThemes } from '../schema/service-themes.table';
import { services } from '../schema/services.table';

const DEFAULT_THEME_COUNT = 100;

export async function runThemesSeed(
  db: ReturnType<typeof drizzle>,
  target = DEFAULT_THEME_COUNT,
) {
  console.log('🌱 Seeding default themes...');

  const allServices = await db
    .select({ id: services.id, slug: services.slug })
    .from(services);

  let totalCreated = 0;
  let toppedUp = 0;

  for (const service of allServices) {
    const prefix = (service.slug.split('-')[0] || 'theme').toLowerCase();
    const namePrefix = `${prefix}-theme-`;

    const existing = await db
      .select({
        name: serviceThemes.name,
        sortOrder: serviceThemes.sortOrder,
      })
      .from(serviceThemes)
      .where(eq(serviceThemes.serviceId, service.id));

    if (existing.length >= target) continue;

    const used = new Set<number>();
    let maxOrder = -1;
    for (const { name, sortOrder } of existing) {
      if (sortOrder > maxOrder) maxOrder = sortOrder;
      if (!name.startsWith(namePrefix)) continue;
      const n = parseInt(name.slice(namePrefix.length), 10);
      if (Number.isFinite(n)) used.add(n);
    }

    const toCreate = target - existing.length;
    const values: (typeof serviceThemes.$inferInsert)[] = [];
    let next = 1;
    for (let i = 0; i < toCreate; i++) {
      while (used.has(next)) next++;
      used.add(next);
      const pad = next < 100 ? String(next).padStart(2, '0') : String(next);
      values.push({
        serviceId: service.id,
        name: `${namePrefix}${pad}`,
        sortOrder: ++maxOrder,
      });
    }

    await db.insert(serviceThemes).values(values);
    totalCreated += values.length;
    toppedUp += 1;
  }

  console.log(
    `     ${totalCreated} themes created across ${toppedUp} service(s) ` +
      `(${allServices.length - toppedUp} already at ${target} — skipped)`,
  );
  console.log('✅ Themes seed complete!');
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });
  const db = drizzle(pool);
  try {
    await runThemesSeed(db);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Themes seed failed:', err);
    process.exit(1);
  });
}
