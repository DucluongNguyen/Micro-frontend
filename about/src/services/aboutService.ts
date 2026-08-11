import queryString from 'query-string';
import httpService from './httpService';
import { API_URL } from '@/contants/api';

type Params = {
  pageIndex?: number;
  pageSize?: number;
  [key: string]: any;
};

class AboutService {
  getPosts(params: Params) {
    return httpService.get(`${API_URL.POSTS}?${queryString.stringify(params)}`);
  }
}

export default new AboutService();
