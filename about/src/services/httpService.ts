import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { IBaseApiResponse } from '@/interfaces';
import { env } from '@/config/env';

class Services {
  axios: AxiosInstance;

  constructor() {
    const token = localStorage.getItem('access_token');
    this.axios = axios.create({
      baseURL: env.HOST_API_URL,
      withCredentials: false,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    //! Interceptor request
    this.axios.interceptors.request.use(
      function (config) {
        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );

    //! Interceptor response
    this.axios.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.reload();

          return Promise.reject(error);
        } else if (error.response?.status === 403) {
          return Promise.reject(error);
        }

        return Promise.reject(error);
      },
    );
  }

  attachTokenToHeader(token: string) {
    this.axios.interceptors.request.use(
      function (config) {
        if (config.headers) {
          config.headers['Authorization'] = `token ${token}`;
        }
        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.axios.get<IBaseApiResponse<T>>(url, config);
  }

  post<T>(url: string, data: any, config?: AxiosRequestConfig) {
    return this.axios.post<IBaseApiResponse<T>>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.axios.delete<IBaseApiResponse<T>>(url, config);
  }

  put<T>(url: string, data: any, config?: AxiosRequestConfig) {
    return this.axios.put<IBaseApiResponse<T>>(url, data, config);
  }
}

export default new Services();
