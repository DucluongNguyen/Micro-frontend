//import loanOverallLimitService from '@/services/loanOverallLimitService';
import { env } from '@/config/env';
import axios from 'axios';
import { useMutation } from 'react-query';

const downloadFile = ({
  url,
  method = 'GET',
  params,
  data,
  fileName = `download.xlxs`,
}: {
  url: string;
  method?: 'GET' | 'POST';
  params?: Record<string, any>;
  data?: any;
  fileName?: string;
}) => {
  const token = localStorage.getItem('access_token');

  return axios
    .request({
      url: `${env.HOST_API_URL}/${url}`,
      method,
      params,
      data,
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], {
        type: typeof contentType === 'string' ? contentType : 'application/octet-stream',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((err) => {
      // error xử lý đã nằm trong interceptor rồi
      return Promise.reject(err);
    });
};

export const useExportFile = () =>
  useMutation({
    mutationFn: ({
      url,
      method = 'GET',
      params,
      data,
      fileName,
    }: {
      url: string;
      method?: 'GET' | 'POST';
      params?: Record<string, any>;
      data?: any;
      fileName?: string;
    }) =>
      downloadFile({
        url,
        method,
        params,
        data,
        fileName,
      }),
  });
