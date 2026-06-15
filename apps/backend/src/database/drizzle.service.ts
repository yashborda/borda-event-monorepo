import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

export type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  db!: DrizzleDB;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    // Hosted Postgres (Neon, Supabase, Render Postgres, RDS) requires TLS;
    // local dev usually doesn't. Opt-in via DB_SSL=true. rejectUnauthorized
    // is false because Neon's cert chain isn't always in Node's default
    // trust store on smaller containers — the connection is still encrypted.
    const useSsl = this.config.get<string>('DB_SSL') === 'true';
    this.pool = new Pool({
      host: this.config.getOrThrow<string>('DB_HOST'),
      port: this.config.getOrThrow<number>('DB_PORT'),
      user: this.config.getOrThrow<string>('DB_USERNAME'),
      password: this.config.getOrThrow<string>('DB_PASSWORD'),
      database: this.config.getOrThrow<string>('DB_NAME'),
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
