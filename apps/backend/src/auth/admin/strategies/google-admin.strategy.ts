import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type Profile,
  type VerifyCallback,
} from 'passport-google-oauth20';
import { and, eq, or } from 'drizzle-orm';
import { DrizzleService } from '../../../database/drizzle.service.js';
import { adminUsers } from '../../../database/schema/admin-users.table.js';

@Injectable()
export class GoogleAdminStrategy extends PassportStrategy(
  Strategy,
  'google-admin',
) {
  constructor(
    config: ConfigService,
    private readonly drizzle: DrizzleService,
  ) {
    super({
      clientID: config.get<string>('ADMIN_GOOGLE_CLIENT_ID') ?? 'placeholder',
      clientSecret:
        config.get<string>('ADMIN_GOOGLE_CLIENT_SECRET') ?? 'placeholder',
      callbackURL:
        config.get<string>('ADMIN_GOOGLE_CALLBACK_URL') ??
        'http://localhost:3001/api/admin/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), undefined);

    const googleId = profile.id;
    const avatarUrl = profile.photos?.[0]?.value ?? null;

    // Admin users must already exist and be active — no auto-create for admin
    const [existing] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(
        and(
          or(eq(adminUsers.googleId, googleId), eq(adminUsers.email, email)),
          eq(adminUsers.isActive, true),
        ),
      )
      .limit(1);

    if (!existing) {
      return done(null, false);
    }

    // Update googleId and avatar if not set
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (!existing.googleId) updates['googleId'] = googleId;
    if (!existing.avatarUrl && avatarUrl) updates['avatarUrl'] = avatarUrl;

    const [updated] = await this.drizzle.db
      .update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, existing.id))
      .returning();

    done(null, updated);
  }
}
