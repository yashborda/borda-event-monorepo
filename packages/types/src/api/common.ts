export type IPaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type IApiErrorData = {
  message: string;
  statusCode: number;
  error?: string;
  [key: string]: unknown;
};

export type IApiError = Error &
  IApiErrorData & {
    data: IApiErrorData;
  };

export type IApiResponse<T> = {
  data: T;
  message?: string;
};

export type IMessageResponse = {
  message: string;
};
