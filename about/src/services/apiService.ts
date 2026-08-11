import type { IBaseApiResponse } from '@/interfaces';
import httpService from './httpService';

export const fetcher = async <T>(url: string): Promise<IBaseApiResponse<T>> => {
  const response = await httpService.get<T>(url);
  return response.data;
};

export const postData = async <T>(url: string, data: any): Promise<IBaseApiResponse<T>> => {
  const response = await httpService.post<T>(url, data);
  return response.data;
};

export const putData = async <T>(url: string, data: any): Promise<IBaseApiResponse<T>> => {
  const response = await httpService.put<T>(url, data);
  return response.data;
};

export const deleteData = async <T>(url: string): Promise<IBaseApiResponse<T>> => {
  const response = await httpService.delete<T>(url);
  return response.data;
};
