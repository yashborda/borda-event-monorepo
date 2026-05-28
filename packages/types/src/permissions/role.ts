import type { IPermission } from "./permission.js";

export type IRole = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IRoleWithPermissions = IRole & {
  permissions: IPermission[];
  userCount: number;
};
