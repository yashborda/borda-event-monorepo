import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type Profile,
  type VerifyCallback,
} from 'passport-google-oauth20';
import { eq, or } from 'drizzle-orm';
import { DrizzleService } from '../../../database/drizzle.service.js';
import { websiteUsers } from '../../../database/schema/website-users.table.js';

@Injectable()
export class GoogleWebsiteStrategy extends PassportStrategy(
  Strategy,
  'google-website',
) {
  constructor(
    config: ConfigService,
    private readonly drizzle: DrizzleService,
  ) {
    super({
      clientID: config.get<string>('WEBSITE_GOOGLE_CLIENT_ID') ?? 'placeholder',
      clientSecret:
        config.get<string>('WEBSITE_GOOGLE_CLIENT_SECRET') ?? 'placeholder',
      callbackURL:
        config.get<string>('WEBSITE_GOOGLE_CALLBACK_URL') ??
        'http://localhost:3000/api/website/auth/google/callback',
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
    const fullName = profile.displayName ?? null;
    const avatarUrl = profile.photos?.[0]?.value ?? null;

    // Find by googleId or email
    const [existing] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(
        or(eq(websiteUsers.googleId, googleId), eq(websiteUsers.email, email)),
      )
      .limit(1);

    if (existing) {
      // Update googleId and avatar if not set
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (!existing.googleId) updates['googleId'] = googleId;
      if (!existing.avatarUrl && avatarUrl) updates['avatarUrl'] = avatarUrl;

      const [updated] = await this.drizzle.db
        .update(websiteUsers)
        .set(updates)
        .where(eq(websiteUsers.id, existing.id))
        .returning();

      return done(null, updated);
    }

    // Create new user
    const [created] = await this.drizzle.db
      .insert(websiteUsers)
      .values({ email, googleId, fullName, avatarUrl, emailVerified: true })
      .returning();

    done(null, created);
  }
}
