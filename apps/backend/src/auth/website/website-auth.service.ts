import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Response } from 'express';

import type { IWebsiteAuthResponse, IWebsiteUser } from '@pkg/types';

import { DrizzleService } from '../../database/drizzle.service.js';
import { magicLinkTokens } from '../../database/schema/magic-link-tokens.table.js';
import { passwordResetTokens } from '../../database/schema/password-reset-tokens.table.js';
import { refreshTokens } from '../../database/schema/refresh-tokens.table.js';
import { websiteUsers } from '../../database/schema/website-users.table.js';
import {
  emailVerificationExpiry,
  generateRefreshToken,
  generateToken,
  hashToken,
  magicLinkExpiry,
  passwordResetExpiry,
  refreshTokenExpiry,
} from '../common/auth.utils.js';
import type { ChangePasswordDto } from '../common/dto/change-password.dto.js';
import type { ForgotPasswordDto } from '../common/dto/forgot-password.dto.js';
import type { LoginDto } from '../common/dto/login.dto.js';
import type { MagicLinkDto } from '../common/dto/magic-link.dto.js';
import type { RegisterDto } from '../common/dto/register.dto.js';
import type { ResetPasswordDto } from '../common/dto/reset-password.dto.js';
import type { UpdateProfileDto } from '../common/dto/update-profile.dto.js';
import { MailService } from '../../mail/mail.service.js';

const REFRESH_COOKIE = 'website_refresh_token';
const SESSION_COOKIE = 'session_exists';
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

@Injectable()
export class WebsiteAuthService {
  private readonly cookieSecure: boolean;
  private readonly websiteUrl: string;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwt: JwtService,
    config: ConfigService,
    private readonly mail: MailService,
  ) {
    this.cookieSecure = config.get<boolean>('COOKIE_SECURE') ?? false;
    this.websiteUrl = config.getOrThrow<string>('WEBSITE_URL');
  }

  // ─── Registration ───────────────────────────────────────────────────────────

  async register(
    dto: RegisterDto,
    res: Response,
  ): Promise<IWebsiteAuthResponse> {
    const existing = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.email, dto.email))
      .limit(1);

    if (existing.length > 0)
      throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await this.drizzle.db
      .insert(websiteUsers)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName ?? null,
      })
      .returning();

    const verificationToken = generateToken();
    const verificationHash = hashToken(verificationToken);
    await this.drizzle.db.insert(magicLinkTokens).values({
      tokenHash: verificationHash,
      email: user.email,
      userType: 'web-verify',
      expiresAt: emailVerificationExpiry(),
    });

    const verificationLink = `${this.websiteUrl}/verify-email?token=${verificationToken}`;
    await this.mail
      .sendWelcomeEmail(user.email, user.fullName, verificationLink)
      .catch(() => {
        // don't fail registration if mail fails
      });

    return this.issueTokensAndRespond(user, res);
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, res: Response): Promise<IWebsiteAuthResponse> {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.email, dto.email))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Account is inactive. Please contact support.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return this.issueTokensAndRespond(user, res);
  }

  // ─── Refresh ─────────────────────────────────────────────────────────────────

  async refresh(
    rawToken: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenHash = hashToken(rawToken);

    const [stored] = await this.drizzle.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.userType, 'website'),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!stored) {
      // Possible token theft — if a revoked token is replayed, revoke the whole family
      await this.revokeFamily(rawToken);
      this.clearCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: revoke old token and issue a new one
    await this.drizzle.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));

    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, stored.userId))
      .limit(1);

    if (!user || !user.isActive) {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }

    const { raw: newRaw, hash: newHash } = generateRefreshToken();
    await this.drizzle.db.insert(refreshTokens).values({
      tokenHash: newHash,
      userId: stored.userId,
      userType: 'website',
      familyId: stored.familyId,
      expiresAt: refreshTokenExpiry(),
    });

    this.setRefreshCookie(res, newRaw);

    const accessToken = this.signAccessToken(user);
    return { accessToken };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(
    userId: string,
    rawToken: string | undefined,
    res: Response,
  ): Promise<void> {
    if (rawToken) {
      await this.drizzle.db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.tokenHash, hashToken(rawToken)),
            eq(refreshTokens.userId, userId),
          ),
        );
    }
    this.clearCookies(res);
  }

  // ─── Email Verification ──────────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<{ message: string }> {
    const tokenHash = hashToken(token);

    const [stored] = await this.drizzle.db
      .select()
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.tokenHash, tokenHash),
          eq(magicLinkTokens.userType, 'web-verify'),
          isNull(magicLinkTokens.usedAt),
          gt(magicLinkTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!stored)
      throw new BadRequestException(
        'Verification link is invalid or has expired.',
      );

    await this.drizzle.db
      .update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.tokenHash, tokenHash));

    await this.drizzle.db
      .update(websiteUsers)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(websiteUsers.email, stored.email));

    return { message: 'Email verified successfully.' };
  }

  // ─── Magic Link ──────────────────────────────────────────────────────────────

  async sendMagicLink(dto: MagicLinkDto): Promise<{ message: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.email, dto.email))
      .limit(1);

    if (user) {
      if (!user.isActive) {
        throw new ForbiddenException(
          'Account is inactive. Please contact support.',
        );
      }

      const raw = generateToken();
      const tokenHash = hashToken(raw);
      await this.drizzle.db.insert(magicLinkTokens).values({
        tokenHash,
        email: dto.email,
        userType: 'website',
        expiresAt: magicLinkExpiry(),
      });

      const link = `${this.websiteUrl}/magic-link/verify?token=${raw}`;
      await this.mail.sendMagicLinkEmail(dto.email, link).catch(() => {});
    }

    return { message: 'If that email exists, a login link has been sent.' };
  }

  async verifyMagicLink(
    token: string,
    res: Response,
  ): Promise<IWebsiteAuthResponse> {
    const tokenHash = hashToken(token);

    const [stored] = await this.drizzle.db
      .select()
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.tokenHash, tokenHash),
          eq(magicLinkTokens.userType, 'website'),
          isNull(magicLinkTokens.usedAt),
          gt(magicLinkTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!stored)
      throw new BadRequestException('Magic link is invalid or has expired.');

    await this.drizzle.db
      .update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.tokenHash, tokenHash));

    // Upsert user — magic link creates account if not exists
    let [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.email, stored.email))
      .limit(1);

    if (!user) {
      [user] = await this.drizzle.db
        .insert(websiteUsers)
        .values({ email: stored.email, emailVerified: true })
        .returning();
    } else {
      if (!user.isActive) {
        throw new ForbiddenException(
          'Account is inactive. Please contact support.',
        );
      }
      if (!user.emailVerified) {
        [user] = await this.drizzle.db
          .update(websiteUsers)
          .set({ emailVerified: true })
          .where(eq(websiteUsers.id, user.id))
          .returning();
      }
    }

    return this.issueTokensAndRespond(user, res);
  }

  // ─── Password Reset ──────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.email, dto.email))
      .limit(1);

    if (user) {
      if (!user.isActive) {
        throw new ForbiddenException(
          'Account is inactive. Please contact support.',
        );
      }

      // Invalidate previous unused reset tokens for this user
      await this.drizzle.db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokens.userId, user.id),
            eq(passwordResetTokens.userType, 'website'),
            isNull(passwordResetTokens.usedAt),
          ),
        );

      const raw = generateToken();
      const tokenHash = hashToken(raw);
      await this.drizzle.db.insert(passwordResetTokens).values({
        tokenHash,
        userId: user.id,
        userType: 'website',
        expiresAt: passwordResetExpiry(),
      });

      const resetLink = `${this.websiteUrl}/reset-password?token=${raw}`;
      await this.mail
        .sendPasswordResetEmail(dto.email, resetLink)
        .catch(() => {});
    }

    return {
      message: 'If that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = hashToken(dto.token);

    const [stored] = await this.drizzle.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.userType, 'website'),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!stored)
      throw new BadRequestException('Reset link is invalid or has expired.');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await Promise.all([
      this.drizzle.db
        .update(websiteUsers)
        .set({ passwordHash })
        .where(eq(websiteUsers.id, stored.userId)),
      this.drizzle.db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.tokenHash, tokenHash)),
      this.drizzle.db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.userId, stored.userId),
            eq(refreshTokens.userType, 'website'),
            isNull(refreshTokens.revokedAt),
          ),
        ),
    ]);

    return { message: 'Password has been reset. Please log in.' };
  }

  // ─── Profile ─────────────────────────────────────────────────────────────────

  async getMe(userId: string): Promise<IWebsiteUser> {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException();
    return this.toPublicUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<IWebsiteUser> {
    const [updated] = await this.drizzle.db
      .update(websiteUsers)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(websiteUsers.id, userId))
      .returning();

    return this.toPublicUser(updated);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(websiteUsers)
      .where(eq(websiteUsers.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException();
    if (!user.passwordHash)
      throw new BadRequestException('No password set on this account.');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect.');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await Promise.all([
      this.drizzle.db
        .update(websiteUsers)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(websiteUsers.id, userId)),
      this.drizzle.db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.userType, 'website'),
            isNull(refreshTokens.revokedAt),
          ),
        ),
    ]);

    return { message: 'Password updated.' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async issueTokensAndRespond(
    user: {
      id: string;
      email: string;
      fullName: string | null;
      avatarUrl: string | null;
      emailVerified: boolean;
      isActive: boolean;
      lastLoginAt: Date | null;
      deletedAt: Date | null;
      deletedReason: string | null;
      createdBy: string | null;
      deletedBy: string | null;
      createdAt: Date;
      updatedAt: Date;
      passwordHash: string | null;
      googleId: string | null;
    },
    res: Response,
  ): Promise<IWebsiteAuthResponse> {
    await this.drizzle.db
      .update(websiteUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(websiteUsers.id, user.id));

    const accessToken = this.signAccessToken(user);

    const { raw, hash, familyId } = generateRefreshToken();
    await this.drizzle.db.insert(refreshTokens).values({
      tokenHash: hash,
      userId: user.id,
      userType: 'website',
      familyId,
      expiresAt: refreshTokenExpiry(),
    });

    this.setRefreshCookie(res, raw);

    return { accessToken, user: this.toPublicUser(user) };
  }

  async issueTokensForGoogleUser(
    user: { id: string; email: string },
    res: Response,
  ): Promise<{ accessToken: string }> {
    await this.drizzle.db
      .update(websiteUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(websiteUsers.id, user.id));

    const accessToken = this.signAccessToken(user);
    const { raw, hash, familyId } = generateRefreshToken();
    await this.drizzle.db.insert(refreshTokens).values({
      tokenHash: hash,
      userId: user.id,
      userType: 'website',
      familyId,
      expiresAt: refreshTokenExpiry(),
    });
    this.setRefreshCookie(res, raw);
    return { accessToken };
  }

  private signAccessToken(user: { id: string; email: string }): string {
    return this.jwt.sign(
      { sub: user.id, email: user.email, subType: 'website' },
      { expiresIn: '15m' },
    );
  }

  private setRefreshCookie(res: Response, raw: string): void {
    res.cookie(REFRESH_COOKIE, raw, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'strict',
      path: '/api/website/auth/refresh',
      maxAge: REFRESH_MAX_AGE * 1000,
    });
    res.cookie(SESSION_COOKIE, 'true', {
      httpOnly: false,
      secure: this.cookieSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_MAX_AGE * 1000,
    });
  }

  private clearCookies(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/website/auth/refresh' });
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  private async revokeFamily(rawToken: string): Promise<void> {
    const hash = hashToken(rawToken);
    const [token] = await this.drizzle.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hash))
      .limit(1);

    if (token) {
      await this.drizzle.db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.familyId, token.familyId),
            isNull(refreshTokens.revokedAt),
          ),
        );
    }
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    isActive: boolean;
    lastLoginAt: Date | null;
    deletedAt: Date | null;
    deletedReason: string | null;
    createdBy: string | null;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): IWebsiteUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      deletedReason: user.deletedReason,
      createdBy: user.createdBy,
      createdByName: null,
      deletedBy: user.deletedBy,
      deletedByName: null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
