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

import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ChangePasswordDto } from '../common/dto/change-password.dto.js';
import { ForgotPasswordDto } from '../common/dto/forgot-password.dto.js';
import { LoginDto } from '../common/dto/login.dto.js';
import { MagicLinkDto } from '../common/dto/magic-link.dto.js';
import { RegisterDto } from '../common/dto/register.dto.js';
import { ResetPasswordDto } from '../common/dto/reset-password.dto.js';
import { UpdateProfileDto } from '../common/dto/update-profile.dto.js';
import type { IWebsiteJwtPayload } from '@pkg/types';
import { WebsiteAuthService } from './website-auth.service.js';

@Throttle({ auth: { ttl: 60_000, limit: 60 } })
@Controller('website/auth')
export class WebsiteAuthController {
  private readonly websiteUrl: string;

  constructor(
    private readonly authService: WebsiteAuthService,
    private readonly config: ConfigService,
  ) {
    this.websiteUrl = config.getOrThrow<string>('WEBSITE_URL');
  }

  @Post('register')
  @HttpCode(201)
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(dto, res);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['website_refresh_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }
    return this.authService.refresh(token, res);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('website-jwt'))
  logout(
    @CurrentUser() user: IWebsiteJwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.['website_refresh_token'] as string | undefined;
    return this.authService.logout(user.sub, token, res);
  }

  @Post('verify-email')
  @HttpCode(200)
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('magic-link')
  @HttpCode(200)
  sendMagicLink(@Body() dto: MagicLinkDto) {
    return this.authService.sendMagicLink(dto);
  }

  @Get('magic-link/verify')
  @HttpCode(200)
  magicLinkVerifyPage(@Query('token') _token: string) {
    // Intermediate page — browser navigates here, shows a confirm button.
    // Frontend renders this. We just return 200 so pre-fetch bots can't consume the token.
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
  @UseGuards(AuthGuard('website-jwt'))
  getMe(@CurrentUser() user: IWebsiteJwtPayload) {
    return this.authService.getMe(user.sub);
  }

  @Patch('me')
  @UseGuards(AuthGuard('website-jwt'))
  updateProfile(
    @CurrentUser() user: IWebsiteJwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('website-jwt'))
  changePassword(
    @CurrentUser() user: IWebsiteJwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google-website'))
  googleLogin() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google-website'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: string; email: string } | undefined;
    if (!user) throw new UnauthorizedException('OAuth failed');

    const { accessToken } = await this.authService.issueTokensForGoogleUser(
      user,
      res,
    );
    res.redirect(`${this.websiteUrl}/auth/callback#token=${accessToken}`);
  }
}
