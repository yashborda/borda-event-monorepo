import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { and, eq, gt, inArray, isNull } from 'drizzle-orm';
import type { Response } from 'express';

import type {
  IAdminAuthResponse,
  IAdminUser,
  IPermissionName,
} from '@pkg/types';

import { DrizzleService } from '../../database/drizzle.service.js';
import { adminUserPermissions } from '../../database/schema/admin-user-permissions.table.js';
import { adminUserRoles } from '../../database/schema/admin-user-roles.table.js';
import { adminUsers } from '../../database/schema/admin-users.table.js';
import { magicLinkTokens } from '../../database/schema/magic-link-tokens.table.js';
import { passwordResetTokens } from '../../database/schema/password-reset-tokens.table.js';
import { permissions } from '../../database/schema/permissions.table.js';
import { refreshTokens } from '../../database/schema/refresh-tokens.table.js';
import { rolePermissions } from '../../database/schema/role-permissions.table.js';
import { roles } from '../../database/schema/roles.table.js';
import {
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
import type { ResetPasswordDto } from '../common/dto/reset-password.dto.js';
import type { UpdateProfileDto } from '../common/dto/update-profile.dto.js';
import { MailService } from '../../mail/mail.service.js';

const REFRESH_COOKIE = 'admin_refresh_token';
const SESSION_COOKIE = 'session_exists';
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

@Injectable()
export class AdminAuthService {
  private readonly cookieSecure: boolean;
  private readonly adminUrl: string;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {
    this.cookieSecure = config.get<boolean>('COOKIE_SECURE') ?? false;
    this.adminUrl = config.getOrThrow<string>('ADMIN_URL');
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, res: Response): Promise<IAdminAuthResponse> {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, dto.email))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Account is inactive. Contact a super admin.',
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
          eq(refreshTokens.userType, 'admin'),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!stored) {
      await this.revokeFamily(rawToken);
      this.clearCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.drizzle.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));

    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, stored.userId))
      .limit(1);

    if (!user || !user.isActive) {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }

    const { raw: newRaw, hash: newHash } = generateRefreshToken();
    await this.drizzle.db.insert(refreshTokens).values({
      tokenHash: newHash,
      userId: stored.userId,
      userType: 'admin',
      familyId: stored.familyId,
      expiresAt: refreshTokenExpiry(),
    });

    this.setRefreshCookie(res, newRaw);

    const accessToken = await this.signAccessToken(user);
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

  // ─── Magic Link ──────────────────────────────────────────────────────────────

  async sendMagicLink(dto: MagicLinkDto): Promise<{ message: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(
        and(eq(adminUsers.email, dto.email), eq(adminUsers.isActive, true)),
      )
      .limit(1);

    if (user) {
      const raw = generateToken();
      const tokenHash = hashToken(raw);
      await this.drizzle.db.insert(magicLinkTokens).values({
        tokenHash,
        email: dto.email,
        userType: 'admin',
        expiresAt: magicLinkExpiry(),
      });

      const link = `${this.adminUrl}/magic-link/verify?token=${raw}`;
      await this.mail.sendMagicLinkEmail(dto.email, link).catch(() => {});
    }

    return { message: 'If that email exists, a login link has been sent.' };
  }

  async verifyMagicLink(
    token: string,
    res: Response,
  ): Promise<IAdminAuthResponse> {
    const tokenHash = hashToken(token);

    const [stored] = await this.drizzle.db
      .select()
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.tokenHash, tokenHash),
          eq(magicLinkTokens.userType, 'admin'),
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

    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(
        and(eq(adminUsers.email, stored.email), eq(adminUsers.isActive, true)),
      )
      .limit(1);

    if (!user) throw new ForbiddenException('Account not found or inactive.');

    return this.issueTokensAndRespond(user, res);
  }

  // ─── Password Reset ──────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(
        and(eq(adminUsers.email, dto.email), eq(adminUsers.isActive, true)),
      )
      .limit(1);

    if (user) {
      await this.drizzle.db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokens.userId, user.id),
            eq(passwordResetTokens.userType, 'admin'),
            isNull(passwordResetTokens.usedAt),
          ),
        );

      const raw = generateToken();
      const tokenHash = hashToken(raw);
      await this.drizzle.db.insert(passwordResetTokens).values({
        tokenHash,
        userId: user.id,
        userType: 'admin',
        expiresAt: passwordResetExpiry(),
      });

      const resetLink = `${this.adminUrl}/reset-password?token=${raw}`;
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
          eq(passwordResetTokens.userType, 'admin'),
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
        .update(adminUsers)
        .set({ passwordHash })
        .where(eq(adminUsers.id, stored.userId)),
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
            eq(refreshTokens.userType, 'admin'),
            isNull(refreshTokens.revokedAt),
          ),
        ),
    ]);

    return { message: 'Password has been reset. Please log in.' };
  }

  // ─── Profile ─────────────────────────────────────────────────────────────────

  async getMe(userId: string): Promise<IAdminUser> {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException();

    const { roleNames, effectivePermissions } =
      await this.computeEffectivePermissions(userId);
    return this.toPublicUser(user, roleNames, effectivePermissions);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<IAdminUser> {
    const [updated] = await this.drizzle.db
      .update(adminUsers)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(adminUsers.id, userId))
      .returning();

    const { roleNames, effectivePermissions } =
      await this.computeEffectivePermissions(userId);
    return this.toPublicUser(updated, roleNames, effectivePermissions);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
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
        .update(adminUsers)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(adminUsers.id, userId)),
      this.drizzle.db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.userType, 'admin'),
            isNull(refreshTokens.revokedAt),
          ),
        ),
    ]);

    return { message: 'Password updated.' };
  }

  // ─── Effective Permissions ────────────────────────────────────────────────────

  async computeEffectivePermissions(
    userId: string,
  ): Promise<{ roleNames: string[]; effectivePermissions: IPermissionName[] }> {
    // Get user's roles
    const userRoleRows = await this.drizzle.db
      .select({ roleId: adminUserRoles.roleId })
      .from(adminUserRoles)
      .where(eq(adminUserRoles.userId, userId));

    const roleIds = userRoleRows.map((r) => r.roleId);

    // Get role names
    let roleNames: string[] = [];
    let rolePermNames: IPermissionName[] = [];

    if (roleIds.length > 0) {
      const roleRows = await this.drizzle.db
        .select({ name: roles.name, slug: roles.slug })
        .from(roles)
        .where(inArray(roles.id, roleIds));

      roleNames = roleRows.map((r) => r.slug ?? r.name);

      // Get permissions for all roles
      const rolePermRows = (await this.drizzle.db
        .select({ slug: permissions.slug })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id),
        )
        .where(inArray(rolePermissions.roleId, roleIds))) as Array<{
        slug: string;
      }>;

      rolePermNames = rolePermRows.map((r) => r.slug as IPermissionName);
    }

    // Get direct user permissions
    const directPermRows = (await this.drizzle.db
      .select({ slug: permissions.slug })
      .from(adminUserPermissions)
      .innerJoin(
        permissions,
        eq(adminUserPermissions.permissionId, permissions.id),
      )
      .where(eq(adminUserPermissions.userId, userId))) as Array<{
      slug: string;
    }>;

    const directPermNames = directPermRows.map(
      (r) => r.slug as IPermissionName,
    );

    // Union (dedup)
    const effectivePermissions = [
      ...new Set([...rolePermNames, ...directPermNames]),
    ] as IPermissionName[];

    return { roleNames, effectivePermissions };
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
      createdAt: Date;
      updatedAt: Date;
    },
    res: Response,
  ): Promise<IAdminAuthResponse> {
    const accessToken = await this.signAccessToken(user);

    await this.drizzle.db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id));

    const { raw, hash, familyId } = generateRefreshToken();
    await this.drizzle.db.insert(refreshTokens).values({
      tokenHash: hash,
      userId: user.id,
      userType: 'admin',
      familyId,
      expiresAt: refreshTokenExpiry(),
    });

    this.setRefreshCookie(res, raw);

    const { roleNames, effectivePermissions } =
      await this.computeEffectivePermissions(user.id);
    return {
      accessToken,
      user: this.toPublicUser(user, roleNames, effectivePermissions),
    };
  }

  async issueTokensForGoogleUser(
    user: { id: string; email: string },
    res: Response,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.signAccessToken(user);
    const { raw, hash, familyId } = generateRefreshToken();
    await this.drizzle.db.insert(refreshTokens).values({
      tokenHash: hash,
      userId: user.id,
      userType: 'admin',
      familyId,
      expiresAt: refreshTokenExpiry(),
    });
    this.setRefreshCookie(res, raw);
    return { accessToken };
  }

  private async signAccessToken(user: {
    id: string;
    email: string;
  }): Promise<string> {
    const { roleNames, effectivePermissions } =
      await this.computeEffectivePermissions(user.id);
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      subType: 'admin',
      roles: roleNames,
      effectivePermissions,
    });
  }

  private setRefreshCookie(res: Response, raw: string): void {
    res.cookie(REFRESH_COOKIE, raw, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'strict',
      path: '/api/admin/auth/refresh',
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
    res.clearCookie(REFRESH_COOKIE, { path: '/api/admin/auth/refresh' });
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

  private toPublicUser(
    user: {
      id: string;
      email: string;
      fullName: string | null;
      avatarUrl: string | null;
      emailVerified: boolean;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    roleNames: string[],
    effectivePermissions: IPermissionName[],
  ): IAdminUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      roles: roleNames,
      effectivePermissions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
