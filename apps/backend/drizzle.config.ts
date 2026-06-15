import { defineConfig } from 'drizzle-kit';

// Hosted Postgres providers (Neon, Supabase, Render Postgres, AWS RDS) require
// SSL. Local Postgres usually doesn't. Gated via the optional DB_SSL env var.
const sslSuffix = process.env.DB_SSL === 'true' ? '?sslmode=require' : '';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DB_USERNAME ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'password'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME}${sslSuffix}`,
  },
});
