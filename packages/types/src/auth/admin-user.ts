import type { IPermissionName } from "../permissions/permission.js";

export type IAdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  roles: string[];
  effectivePermissions: IPermissionName[];
  createdAt: string;
  updatedAt: string;
};
