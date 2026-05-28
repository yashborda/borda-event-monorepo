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
    this.pool = new Pool({
      host: this.config.getOrThrow<string>('DB_HOST'),
      port: this.config.getOrThrow<number>('DB_PORT'),
      user: this.config.getOrThrow<string>('DB_USERNAME'),
      password: this.config.getOrThrow<string>('DB_PASSWORD'),
      database: this.config.getOrThrow<string>('DB_NAME'),
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
