export type IRegisterRequest = {
  email: string;
  password: string;
  fullName?: string;
};

export type ILoginRequest = {
  email: string;
  password: string;
};

export type IMagicLinkRequest = {
  email: string;
};

export type IForgotPasswordRequest = {
  email: string;
};

export type IResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type IUpdateProfileRequest = {
  fullName?: string;
  avatarUrl?: string;
};

export type IChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
