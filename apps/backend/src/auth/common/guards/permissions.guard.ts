import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { IAdminJwtPayload } from '@pkg/types';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!required || required.length === 0) return true;

    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as IAdminJwtPayload | undefined;

    if (!user) throw new ForbiddenException();

    const effective: string[] = user.effectivePermissions ?? [];
    const hasAny = required.some((perm) => effective.includes(perm));

    if (!hasAny) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
