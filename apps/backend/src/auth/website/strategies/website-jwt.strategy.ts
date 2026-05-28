import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { IWebsiteJwtPayload } from '@pkg/types';

@Injectable()
export class WebsiteJwtStrategy extends PassportStrategy(
  Strategy,
  'website-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('WEBSITE_JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: IWebsiteJwtPayload): IWebsiteJwtPayload {
    return payload;
  }
}
