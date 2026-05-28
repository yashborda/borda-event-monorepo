import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lt, isNotNull } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { refreshTokens } from '../database/schema/refresh-tokens.table.js';
import { magicLinkTokens } from '../database/schema/magic-link-tokens.table.js';
import { passwordResetTokens } from '../database/schema/password-reset-tokens.table.js';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  /** Run every hour — delete expired or revoked refresh tokens */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupRefreshTokens() {
    const now = new Date();

    // Delete tokens that are expired OR revoked
    const deleted = await this.drizzle.db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, now))
      .returning({ id: refreshTokens.id });

    if (deleted.length > 0) {
      this.logger.log(`Cleaned up ${deleted.length} expired refresh tokens`);
    }
  }

  /** Run every 30 minutes — delete used/expired magic link tokens */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupMagicLinkTokens() {
    const now = new Date();

    const expired = await this.drizzle.db
      .delete(magicLinkTokens)
      .where(lt(magicLinkTokens.expiresAt, now))
      .returning({ id: magicLinkTokens.id });

    const used = await this.drizzle.db
      .delete(magicLinkTokens)
      .where(isNotNull(magicLinkTokens.usedAt))
      .returning({ id: magicLinkTokens.id });

    const total = expired.length + used.length;
    if (total > 0) {
      this.logger.log(`Cleaned up ${total} magic link tokens`);
    }
  }

  /** Run every 30 minutes — delete used/expired password reset tokens */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupPasswordResetTokens() {
    const now = new Date();

    const expired = await this.drizzle.db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, now))
      .returning({ id: passwordResetTokens.id });

    const used = await this.drizzle.db
      .delete(passwordResetTokens)
      .where(isNotNull(passwordResetTokens.usedAt))
      .returning({ id: passwordResetTokens.id });

    const total = expired.length + used.length;
    if (total > 0) {
      this.logger.log(`Cleaned up ${total} password reset tokens`);
    }
  }
}
