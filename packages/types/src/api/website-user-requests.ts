export type IListWebsiteUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  includeDeleted?: boolean;
};

export type ICreateWebsiteUserRequest = {
  email: string;
  fullName: string;
  password: string;
};

export type IUpdateWebsiteUserRequest = {
  fullName?: string;
  email?: string;
  isActive?: boolean;
};

export type IDeleteWebsiteUserRequest = {
  reason: string;
};
