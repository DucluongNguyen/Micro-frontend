import { useMemo, useState } from 'react';
import { Commons } from '@/components/commons';
import type { SelectOption } from '@/components/commons/Select';
import type { FilterFieldConfig } from '@/templates/components/Filter';
import { API_URL } from '@/contants/api';
import { useGetApi } from '../useApi';
import { convertToFormSelect } from '@/helpers';

export const ROLE_OPTIONS: SelectOption[] = [
  { label: 'Quản trị viên', value: 'ADMIN' },
  { label: 'Biên tập viên', value: 'EDITOR' },
  { label: 'Người xem', value: 'VIEWER' },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Không hoạt động', value: 'INACTIVE' },
];

export const useFilterAbout = () => {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const { data, refetch } = useGetApi(
    {
      apiUrl: API_URL.POSTS,
      queryKey: ['posts'],
      message: '',
    },
    {
      enabled: false,
    },
  );

  const filterFields = useMemo<FilterFieldConfig[]>(
    () => [
      {
        name: 'keyword',
        component: Commons.Input,
        componentProps: { placeholder: 'Nhập từ khoá' },
      },
      {
        name: 'role',
        component: Commons.Select,
        componentProps: { placeholder: 'Chọn vai trò', options: ROLE_OPTIONS },
      },
      {
        name: 'status',
        component: Commons.Select,
        componentProps: { placeholder: 'Chọn trạng thái', options: STATUS_OPTIONS },
      },
      {
        name: 'createdAt',
        component: Commons.DateRangePicker,
        componentProps: { placeholder: 'Ngày tạo' },
      },

      {
        name: 'name',
        component: Commons.Select,
        componentProps: {
          placeholder: 'Chọn tên',
          fetchOptions: refetch,
          options: convertToFormSelect(data ?? [], 'title', 'id'),
        },
      },
    ],
    [data, refetch],
  );

  const onSearch = (values: Record<string, unknown>) => {
    setFilters(values);
  };

  return { filterFields, filters, onSearch };
};
