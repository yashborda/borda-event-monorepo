// Auth types
export type { IWebsiteUser } from "./auth/website-user.js";
export type { IAdminUser } from "./auth/admin-user.js";
export type {
  IAuthResponse,
  IWebsiteAuthResponse,
  IAdminAuthResponse,
  IRefreshResponse,
} from "./auth/auth-response.js";
export type {
  IWebsiteJwtPayload,
  IAdminJwtPayload,
  IJwtPayload,
} from "./auth/token.js";

// Permission types
export type { IPermissionName, IPermission } from "./permissions/permission.js";
export type { IRole, IRoleWithPermissions } from "./permissions/role.js";
export type { IEffectivePermissions } from "./permissions/effective-permissions.js";
export type { IAdminUserDetail } from "./permissions/admin-user-detail.js";

// API types
export type {
  IPaginatedResponse,
  IApiError,
  IApiErrorData,
  IApiResponse,
  IMessageResponse,
} from "./api/common.js";
export type {
  IRegisterRequest,
  ILoginRequest,
  IMagicLinkRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
  IUpdateProfileRequest,
  IChangePasswordRequest,
} from "./api/auth-requests.js";
export type {
  ICreateAdminUserRequest,
  IUpdateAdminUserRequest,
  IAssignRolesRequest,
  IAssignPermissionsRequest,
  ICreateRoleRequest,
  IUpdateRoleRequest,
  IListUsersQuery,
} from "./api/user-requests.js";
export type {
  IListWebsiteUsersQuery,
  ICreateWebsiteUserRequest,
  IUpdateWebsiteUserRequest,
  IDeleteWebsiteUserRequest,
} from "./api/website-user-requests.js";
export type {
  BlogStatus,
  BlogPublishStatus,
  RobotsDirective,
  IMediaFile,
  IBlogCategory,
  IBlogCategoryDetail,
  IBlogAuthor,
  IBlogTag,
  IBlogListItem,
  IBlogDetail,
} from "./api/blog-responses.js";
export type {
  BillStatus,
  InquiryStatus,
  SocialPlatform,
  ServiceVideoType,
  ICustomer,
  IService,
  IServiceMediaItem,
  IServiceDetail,
  IServiceTheme,
  IServiceThemeVideo,
  IServiceThemeWithMedia,
  IThemeLinkedService,
  ICatalogue,
  ICatalogueServiceItem,
  ICatalogueDetail,
  ISocialPost,
  IInquiry,
  IInquiryDetail,
  IBill,
  IBillItem,
  IBillDetail,
} from "./api/event-responses.js";
