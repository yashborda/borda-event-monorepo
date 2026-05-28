import { Controller, Get, HttpCode } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service.js';
import { sql } from 'drizzle-orm';

@Controller('health')
export class HealthController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  @HttpCode(200)
  async check() {
    let dbStatus: 'healthy' | 'unhealthy' = 'unhealthy';
    try {
      await this.drizzle.db.execute(sql`SELECT 1`);
      dbStatus = 'healthy';
    } catch {
      // db ping failed
    }

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      api: 'healthy',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
