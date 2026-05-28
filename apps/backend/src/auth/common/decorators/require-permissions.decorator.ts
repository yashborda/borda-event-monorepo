import { SetMetadata } from '@nestjs/common';
import type { IPermissionName } from '@pkg/types';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: IPermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
