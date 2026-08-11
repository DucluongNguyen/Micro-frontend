import { API_URL } from '@/contants/api';
import { useColumnTable } from '@/hooks/abouts/useColumnTable';
import { useFilterAbout } from '@/hooks/abouts/useFilterAbout';
import { useFormItems } from '@/hooks/abouts/useFormItems';
import aboutService from '@/services/aboutService';
import PortalTemplate from '@/templates/PortalTemplate';
import * as yup from 'yup';

const FILTER_INITIAL_VALUES = { keyword: undefined, role: undefined, status: undefined, createdAt: undefined };

export const validationSchema = yup.object().shape({
  title: yup.string().required('Vui lòng nhập tiêu đề'),
  body: yup.string().required('Vui lòng nhập nội dung'),
});

export default function About() {
  // !hooks
  const { filterFields, filters, onSearch } = useFilterAbout();
  const { fieldItems } = useFormItems();
  const { columns } = useColumnTable({
    fieldItems,
    title: 'About',
    validationSchema,
    apiEditUrl: API_URL.POSTS,
    apiDetailUrl: API_URL.POSTS,
    isViewPermission: 'TEST',
    isEditPermission: 'TEST',
  });

  // !Function
  const handleSearch = (values: Record<string, unknown>) => {
    onSearch(values);
  };

  // !Render
  return (
    <div>
      <PortalTemplate
        header={{
          title: 'Phê duyệt',
          isAddNew: true,
          addNewPermission: 'TEST',
          isExport: true,
          exportPermission: 'TEST',
        }}
        formModal={{
          initialValues: {},
          apiCreateUrl: API_URL.POSTS,
          title: 'Tạo mới About',
          validationSchema,
          fieldItems,
        }}
        filter={{
          fields: filterFields,
          initialValues: FILTER_INITIAL_VALUES,
          onSearch: handleSearch,
          filters,
        }}
        table={{ api: aboutService.getPosts, columns, queryKey: 'table-about' }}
      />
    </div>
  );
}
