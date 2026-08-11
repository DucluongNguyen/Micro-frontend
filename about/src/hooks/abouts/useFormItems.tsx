import { Commons } from '@/components/commons';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './useFilterAbout';
import { useGetApi } from '../useApi';
import { API_URL } from '@/contants/api';
import { convertToFormSelect } from '@/helpers';

export const useFormItems = () => {
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

  const fieldItemsLeft = () => [
    {
      name: 'title',
      component: Commons.Input,
      componentProps: {
        placeholder: 'Nhập tiêu đề',
        label: 'Tiêu đề',
        required: true,
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
    {
      name: 'role',
      component: Commons.Select,
      componentProps: {
        placeholder: 'Chọn vai trò',
        options: ROLE_OPTIONS,
        label: 'Vai trò',
        labelCol: { span: 7, style: { textAlign: 'left' } },
        // afterOnchange: (value) => {
        //   console.log(value);
        // },
      },
    },
    {
      name: 'status',
      component: Commons.Select,
      componentProps: {
        placeholder: 'Chọn trạng thái',
        options: STATUS_OPTIONS,
        label: 'Trạng thái',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
    {
      name: 'createdAt',
      component: Commons.DateRangePicker,
      componentProps: {
        placeholder: 'Ngày tạo',
        label: 'Ngày tạo',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },

    {
      name: 'name',
      component: Commons.Select,
      componentProps: {
        placeholder: 'Chọn tên',
        fetchOptions: refetch,
        options: convertToFormSelect(data ?? [], 'title', 'id'),
        label: 'Tên',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
  ];

  const fieldItemsRight = () => [
    {
      name: 'body',
      component: Commons.Input,
      componentProps: {
        placeholder: 'Nhập nội dung',
        label: 'Nội dung',
        required: true,
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
    {
      name: 'role2',
      component: Commons.Select,
      componentProps: {
        placeholder: 'Chọn vai trò',
        options: ROLE_OPTIONS,
        label: 'Vai trò 2',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
    {
      name: 'status2',
      component: Commons.Select,
      componentProps: {
        placeholder: 'Chọn trạng thái',
        options: STATUS_OPTIONS,
        label: 'Trạng thái 2',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
    {
      name: 'createdAt2',
      component: Commons.DateRangePicker,
      componentProps: {
        placeholder: 'Ngày tạo',
        label: 'Ngày tạo 2',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },

    {
      name: 'name2',
      component: Commons.Select,
      componentProps: {
        placeholder: 'Chọn tên',
        fetchOptions: refetch,
        options: convertToFormSelect(data ?? [], 'title', 'id'),
        label: 'Tên 2',
        labelCol: { span: 7, style: { textAlign: 'left' } },
      },
    },
  ];

  const normalizedFieldItems = [fieldItemsLeft(), fieldItemsRight()].map((row: Array<any>) =>
    row.map((field: any) => ({
      ...field,
      label:
        typeof field.label === 'string'
          ? field.label
          : typeof field.componentProps?.label === 'string'
            ? field.componentProps.label
            : field.name,
    })),
  );

  return { fieldItems: normalizedFieldItems };
};
