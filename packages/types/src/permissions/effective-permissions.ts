import type { IPermissionName } from "./permission.js";

export type IEffectivePermissions = {
  userId: string;
  roles: string[];
  rolePermissions: IPermissionName[];
  directPermissions: IPermissionName[];
  effectivePermissions: IPermissionName[];
};
