import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import type { IAdminJwtPayload } from '@pkg/types';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ChangePasswordDto } from '../common/dto/change-password.dto.js';
import { ForgotPasswordDto } from '../common/dto/forgot-password.dto.js';
import { LoginDto } from '../common/dto/login.dto.js';
import { MagicLinkDto } from '../common/dto/magic-link.dto.js';
import { ResetPasswordDto } from '../common/dto/reset-password.dto.js';
import { UpdateProfileDto } from '../common/dto/update-profile.dto.js';
import { AdminAuthService } from './admin-auth.service.js';

@Throttle({ auth: { ttl: 60_000, limit: 60 } })
@Controller('admin/auth')
export class AdminAuthController {
  private readonly adminUrl: string;

  constructor(
    private readonly authService: AdminAuthService,
    private readonly config: ConfigService,
  ) {
    this.adminUrl = config.getOrThrow<string>('ADMIN_URL');
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['admin_refresh_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }
    return this.authService.refresh(token, res);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('admin-jwt'))
  logout(
    @CurrentUser() user: IAdminJwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.['admin_refresh_token'] as string | undefined;
    return this.authService.logout(user.sub, token, res);
  }

  @Post('magic-link')
  @HttpCode(200)
  sendMagicLink(@Body() dto: MagicLinkDto) {
    return this.authService.sendMagicLink(dto);
  }

  @Get('magic-link/verify')
  @HttpCode(200)
  magicLinkVerifyPage(@Query('token') _token: string) {
    return { status: 'pending' };
  }

  @Post('magic-link/verify')
  @HttpCode(200)
  verifyMagicLink(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyMagicLink(token, res);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('admin-jwt'))
  getMe(@CurrentUser() user: IAdminJwtPayload) {
    return this.authService.getMe(user.sub);
  }

  @Patch('me')
  @UseGuards(AuthGuard('admin-jwt'))
  updateProfile(
    @CurrentUser() user: IAdminJwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('admin-jwt'))
  changePassword(
    @CurrentUser() user: IAdminJwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google-admin'))
  googleLogin() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google-admin'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: string; email: string } | undefined;
    if (!user) {
      res.redirect(`${this.adminUrl}/auth/error?reason=oauth_failed`);
      return;
    }
    const { accessToken } = await this.authService.issueTokensForGoogleUser(
      user,
      res,
    );
    res.redirect(`${this.adminUrl}/auth/callback#token=${accessToken}`);
  }
}
