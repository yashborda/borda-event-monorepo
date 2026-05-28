export type ICreateAdminUserRequest = {
  email: string;
  password: string;
  fullName?: string;
  roleIds: string[];
};

export type IUpdateAdminUserRequest = {
  fullName?: string;
  email?: string;
  isActive?: boolean;
};

export type IAssignRolesRequest = {
  roleIds: string[];
};

export type IAssignPermissionsRequest = {
  permissionIds: string[];
};

export type ICreateRoleRequest = {
  name: string;
  description?: string;
  permissionIds?: string[];
};

export type IUpdateRoleRequest = {
  description?: string;
};

export type IListUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
};
