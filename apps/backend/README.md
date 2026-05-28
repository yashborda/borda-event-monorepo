# Frostleaf Backend

NestJS API server. Runs on port **3002**.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm 9+

## Setup

```bash
# From monorepo root
pnpm install

# Create the database
createdb frostleaf

# Copy and fill in env vars
cp apps/backend/.env.example apps/backend/.env

# Run migrations
pnpm --filter backend db:migrate

# Seed permissions, roles, and default admin user
pnpm --filter backend seed

# Seed blog dummy data (authors, categories, tags, 200 posts)
pnpm --filter backend seed:blogs
```

Default admin: `admin@admin.com` / `password`

## Development

```bash
pnpm --filter backend start:dev    # watch mode
pnpm --filter backend start        # single run
```

## Build & Production

```bash
pnpm --filter backend build
pnpm --filter backend start:prod
```

## Database

```bash
pnpm --filter backend db:push      # sync schema to DB instantly (development)
pnpm --filter backend db:generate  # generate a versioned migration file (production)
pnpm --filter backend db:migrate   # apply pending migration files
pnpm --filter backend db:studio    # open Drizzle Studio
```

### Development vs production workflow

**Development — use `db:push`**

After changing any file under `src/database/schema/`, run:

```bash
pnpm --filter backend db:push
```

This directly syncs your Drizzle schema to the database with no migration files and no interactive prompts. It is safe to run repeatedly.

**Production — use `db:generate` + `db:migrate`**

`db:generate` is interactive — it must be run in a real terminal (not inside Claude Code or any non-TTY environment). Run it before deploying:

```bash
pnpm --filter backend db:generate  # creates a versioned .sql file in src/migrations/
pnpm --filter backend db:migrate   # applies it
```

Commit the generated `.sql` file and the updated `src/migrations/meta/_journal.json` alongside your schema changes.

### Reset database (drop → migrate → seed)

> **Warning:** destroys all data. Never run in production.

```bash
pnpm --filter backend db:reset
```

This command:
1. Drops the `public` and `drizzle` schemas entirely
2. Re-runs all migrations from scratch
3. Re-seeds permissions, roles, and the default admin user

After the reset, log in with `admin@admin.com` / `password`.

## Other Commands

```bash
pnpm --filter backend type-check
pnpm --filter backend lint
pnpm --filter backend format
pnpm --filter backend test
pnpm --filter backend test:e2e
```
