import type { IPermission, IPermissionName } from "./permission.js";
import type { IRole } from "./role.js";

export type IAdminUserDetail = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  createdBy: string | null;
  createdByName: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  roles: IRole[];
  directPermissions: IPermission[];
  effectivePermissions: IPermissionName[];
  createdAt: string;
  updatedAt: string;
};
