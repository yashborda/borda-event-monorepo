/**
 * Reset script — drops all tables, re-runs migrations, re-seeds.
 * Run via: pnpm --filter backend db:reset
 *
 * WARNING: Destroys all data. Do not run in production.
 */

import { execSync } from 'child_process';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runSeed } from './seed';

const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME,
  // Hosted Postgres (Neon/Supabase/RDS) requires TLS; local doesn't.
  ssl:
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

async function reset() {
  // 1. Drop and recreate public schema
  console.log('🗑️  Dropping all tables...');
  const dropPool = new Pool(DB_CONFIG);
  const client = await dropPool.connect();
  try {
    await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    await client.query('GRANT ALL ON SCHEMA public TO current_user');
  } finally {
    client.release();
    await dropPool.end();
  }
  console.log('   Done.');

  // 2. Run migrations via drizzle-kit CLI
  console.log('📦 Running migrations...');
  execSync('pnpm db:migrate', { stdio: 'inherit', cwd: process.cwd() });
  console.log('   Done.');

  // 3. Seed with a fresh pool
  const seedPool = new Pool(DB_CONFIG);
  try {
    await runSeed(drizzle(seedPool));
  } finally {
    await seedPool.end();
  }
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
