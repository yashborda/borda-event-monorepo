import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { WebsiteAuthController } from './website-auth.controller.js';
import { WebsiteAuthService } from './website-auth.service.js';
import { WebsiteJwtStrategy } from './strategies/website-jwt.strategy.js';
import { GoogleWebsiteStrategy } from './strategies/google-website.strategy.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('WEBSITE_JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [WebsiteAuthController],
  providers: [WebsiteAuthService, WebsiteJwtStrategy, GoogleWebsiteStrategy],
})
export class WebsiteAuthModule {}
