import { API_URL } from '@/contants/api';
import { useFilterWaittingAbout } from '@/hooks/abouts/useFilterWaittingAbout';
import { useFormItems } from '@/hooks/abouts/useFormItems';
import { useWaittingColumnTable } from '@/hooks/abouts/useWaittingColumnTable';
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
  const { filterFields, filters, onSearch } = useFilterWaittingAbout();
  const { fieldItems } = useFormItems();
  const { columns } = useWaittingColumnTable({
    fieldItems,
    title: 'About',
    validationSchema,
    apiEditUrl: API_URL.POSTS,
    apiDetailUrl: API_URL.POSTS,
    apiRejectUrl: API_URL.POSTS,
    isViewPermission: 'TEST',
    isEditPermission: 'TEST',
    isRejectPermission: 'TEST',
    isApprovePermission: 'TEST',
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
          title: 'Chờ phê duyệt',
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
