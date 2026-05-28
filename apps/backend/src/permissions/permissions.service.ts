import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service.js';
import { permissions } from '../database/schema/permissions.table.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listAll() {
    return this.drizzle.db.select().from(permissions);
  }
}
