import type { IMediaFile } from "./blog-responses.js";

export type BillStatus = "draft" | "confirmed" | "completed" | "cancelled";
export type InquiryStatus = "new" | "contacted" | "booked" | "lost";
export type SocialPlatform = "instagram" | "facebook" | "youtube";

// ── Customers ──────────────────────────────────────────────
export type ICustomer = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  billsCount: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

// ── Services ───────────────────────────────────────────────
export type IService = {
  id: string;
  name: string;
  slug: string;
  coverImage: IMediaFile | null;
  isActive: boolean;
  sortOrder: number;
  mediaCount: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IServiceMediaItem = IMediaFile & {
  sortOrder: number;
  themeId: string | null;
  isFeatured: boolean;
};

export type ServiceVideoType = "instagram" | "drive";

export type IServiceThemeVideo = {
  id: string;
  type: ServiceVideoType;
  title: string | null;
  instagramUrl: string | null;
  driveFileId: string | null;
  driveUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
};

export type IServiceTheme = {
  id: string;
  serviceId: string;
  name: string;
  description: string | null;
  price: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** A service a theme is linked to — used for the admin "Also in …" badge. */
export type IThemeLinkedService = {
  id: string;
  name: string;
  slug: string;
};

export type IServiceThemeWithMedia = IServiceTheme & {
  media: (IMediaFile & { sortOrder: number; isFeatured: boolean })[];
  videos: IServiceThemeVideo[];
  /**
   * Every service this (shared) theme is linked to, including the current one.
   * A length > 1 means the theme is shared. Present on admin theme lists.
   */
  linkedServices: IThemeLinkedService[];
};

export type IServiceDetail = IService & {
  description: string | null;
  bannerImage: IMediaFile | null;
  media: IServiceMediaItem[];
  themes: IServiceThemeWithMedia[];
};

// ── Catalogues ─────────────────────────────────────────────
export type ICatalogue = {
  id: string;
  title: string;
  slug: string;
  coverImage: IMediaFile | null;
  isPublic: boolean;
  viewCount: number;
  serviceCount: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ICatalogueServiceItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  coverImage: IMediaFile | null;
  sortOrder: number;
};

export type ICatalogueDetail = ICatalogue & {
  description: string | null;
  services: ICatalogueServiceItem[];
};

// ── Social posts (no soft delete) ──────────────────────────
export type ISocialPost = {
  id: string;
  platform: SocialPlatform;
  postUrl: string;
  caption: string | null;
  isFeatured: boolean;
  sortOrder: number;
  thumbnail: IMediaFile | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

// ── Inquiries (no soft delete) ─────────────────────────────
export type IInquiry = {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  eventDate: string | null;
  status: InquiryStatus;
  catalogueId: string | null;
  catalogueTitle: string | null;
  customerId: string | null;
  customerName: string | null;
  createdAt: string;
};

export type IInquiryDetail = IInquiry & {
  catalogueSlug: string | null;
  customerPhone: string | null;
};

// ── Bills ──────────────────────────────────────────────────
export type IBill = {
  id: string;
  billNo: string;
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  bookingDate: string;
  eventDate: string;
  destinationAddr: string | null;
  totalAmount: number;
  advanceAmount: number;
  creditBalance: number;
  status: BillStatus;
  itemCount: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IBillItem = {
  id: string;
  serviceId: string | null;
  serviceName: string | null;
  description: string;
  qty: number;
  amount: number;
  sortOrder: number;
};

export type IBillDetail = {
  id: string;
  billNo: string;
  customer: {
    id: string | null;
    fullName: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  bookingDate: string;
  eventDate: string;
  destinationAddr: string | null;
  totalAmount: number;
  advanceAmount: number;
  creditBalance: number;
  status: BillStatus;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
  items: IBillItem[];
};
