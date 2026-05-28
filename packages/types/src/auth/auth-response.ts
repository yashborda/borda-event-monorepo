import type { IAdminUser } from "./admin-user.js";
import type { IWebsiteUser } from "./website-user.js";

export type IAuthResponse = {
  accessToken: string;
  user: IWebsiteUser | IAdminUser;
};

export type IWebsiteAuthResponse = {
  accessToken: string;
  user: IWebsiteUser;
};

export type IAdminAuthResponse = {
  accessToken: string;
  user: IAdminUser;
};

export type IRefreshResponse = {
  accessToken: string;
};
