export type IPermissionName =
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "roles:read"
  | "roles:create"
  | "roles:update"
  | "roles:delete"
  | "permissions:read"
  | "website-users:read"
  | "website-users:create"
  | "website-users:update"
  | "website-users:delete"
  | "blog-categories:read"
  | "blog-categories:create"
  | "blog-categories:update"
  | "blog-categories:delete"
  | "blog-authors:read"
  | "blog-authors:create"
  | "blog-authors:update"
  | "blog-authors:delete"
  | "blog-tags:read"
  | "blog-tags:create"
  | "blog-tags:update"
  | "blog-tags:delete"
  | "blogs:read"
  | "blogs:create"
  | "blogs:update"
  | "blogs:delete"
  | "blogs:publish"
  | "blogs:revalidate"
  | "blog-categories:revalidate"
  | "blog-tags:revalidate"
  | "blog-authors:revalidate";

export type IPermission = {
  id: string;
  slug: IPermissionName;
  label: string | null;
  resource: string;
  action: string;
  description: string | null;
  createdAt: string;
};
