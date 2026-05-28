export type BlogStatus = "draft" | "published";
export type BlogPublishStatus = "draft" | "published";
export type RobotsDirective = "index" | "noindex";

export type IMediaFile = {
  id: string;
  url: string;
  folder: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export type IBlogCategory = {
  id: string;
  categoryName: string;
  slug: string;
  status: BlogStatus;
  bannerImage: IMediaFile | null;
  sortOrder: number;
  excerpt: string | null;
  blogsCount: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IBlogCategoryDetail = IBlogCategory & {
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: IMediaFile | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: IMediaFile | null;
  robots: RobotsDirective;
  googlebot: RobotsDirective;
};

export type IBlogAuthor = {
  id: string;
  fullName: string;
  slug: string;
  email: string;
  avatar: IMediaFile | null;
  bio: string | null;
  designation: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  status: "active" | "inactive";
  numberOfBlogsWritten: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IBlogTag = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  status: BlogStatus;
  excerpt: string | null;
  blogsCount: number;
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IBlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: IMediaFile | null;
  featuredImageAlt: string | null;
  status: BlogPublishStatus;
  publishedAt: string | null;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  readingTime: number;
  author: {
    id: string;
    fullName: string;
    slug: string;
    avatar: IMediaFile | null;
  } | null;
  categories: { id: string; categoryName: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  createdBy: string | null;
  createdByName: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  deletedBy: string | null;
  deletedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IBlogDetail = IBlogListItem & {
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: IMediaFile | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: IMediaFile | null;
  robots: RobotsDirective;
  googlebot: RobotsDirective;
};
