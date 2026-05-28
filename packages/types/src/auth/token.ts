import type { IPermissionName } from "../permissions/permission.js";

export type IWebsiteJwtPayload = {
  sub: string;
  email: string;
  subType: "website";
  iat?: number;
  exp?: number;
};

export type IAdminJwtPayload = {
  sub: string;
  email: string;
  subType: "admin";
  roles: string[];
  effectivePermissions: IPermissionName[];
  iat?: number;
  exp?: number;
};

export type IJwtPayload = IWebsiteJwtPayload | IAdminJwtPayload;
