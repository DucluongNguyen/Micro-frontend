import { useMutation, useQuery } from 'react-query';
import { fetcher, postData, putData } from '@/services/apiService';
import { getErrorMsg } from '@/helpers';
import { useToast } from './useToast';

type Config = {
  apiUrl: string;
  message: string;
  queryKey?: [x: any];
  id?: string | number;
};

export const usePostApi = (config: Config) => {
  const { showMessage } = useToast();
  return useMutation({
    mutationFn: (data: any) => postData(config.apiUrl, data),
    onError: (error) => {
      showMessage({ type: 'error', content: getErrorMsg(error) });
    },
    onSuccess() {
      if (config.message) {
        showMessage({ type: 'success', content: config.message });
      }
    },
  });
};

export const usePutApi = (config: Config) => {
  const { showMessage } = useToast();
  return useMutation({
    mutationFn: (data: any) => putData(config.apiUrl, data),
    onError: (error) => {
      showMessage({ type: 'error', content: getErrorMsg(error) });
    },
    onSuccess() {
      if (config.message) {
        showMessage({ type: 'success', content: config.message });
      }
    },
  });
};

export const useGetApi = (config: Config, options?: any) => {
  const queryKey = config.queryKey ? [...config.queryKey] : [];

  return useQuery(queryKey, () => fetcher(config.apiUrl), options);
};
