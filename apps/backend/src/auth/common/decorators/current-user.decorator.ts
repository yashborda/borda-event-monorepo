import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { IAdminJwtPayload, IWebsiteJwtPayload } from '@pkg/types';

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): IWebsiteJwtPayload | IAdminJwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as IWebsiteJwtPayload | IAdminJwtPayload;
  },
);
