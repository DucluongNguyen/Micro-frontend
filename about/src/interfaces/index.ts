export interface List<T> extends Array<T> {
  [index: number]: T;
}

export interface Pagination {
  pageIndex?: number;
  pageSize?: number;
}

export interface IBaseApiResponse<T> {
  status: number;
  code: string | number;
  message: string;
  data?: T;
  responseTime: string;
  requestId: string;
}

export interface IPaginationResponse<T> {
  size: number;
  page: number;
  empty: boolean;
  totalPages: number;
  totalElements: number;
  collection: T[];
}

export interface OptionType {
  label: string;
  value: string;
}
export interface ErrorType<T> {
  code: string;
  data: T;
  message: string;
  responseTime: string;
  status: number;
}
