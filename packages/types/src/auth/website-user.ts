export type IWebsiteUser = {
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
  createdAt: string;
  updatedAt: string;
};
