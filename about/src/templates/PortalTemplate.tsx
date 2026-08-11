import { Commons } from '@/components/commons';
import { useAppContext } from '@/contexts/AppContext';
import useTablePagination from '@/hooks/useTablePagination';
import useToggleDialog from '@/hooks/useToggleDialog';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Card, Col, Flex, Row, Typography } from 'antd';
import { Field, Form, Formik, type FormikProps } from 'formik';
import { useCallback, useRef } from 'react';
import Filter, { type FilterProps } from './components/Filter';
import Table from './components/Table';
import { usePostApi } from '@/hooks/useApi';
import { useExportFile } from '@/hooks/useExport';
import { formatDate } from '@/helpers';

type Props = {
  header: {
    title?: string;
    addNewPermission?: string;
    exportPermission?: string;
    importPermission?: string;
    isAddNew?: boolean;
    isExport?: boolean;
    exportUrl?: string;
    importUrl?: string;
    onUploadSuccess?: () => void;
    fileName?: string;
  };
  filter?: FilterProps & {
    filters?: Record<string, unknown>;
  };
  table: {
    api: (data: any) => Promise<any>;
    columns: any[];
    queryKey: string;
  };
  formModal: {
    initialValues: Record<string, unknown>;
    apiCreateUrl: string;
    textConfirm?: string;
    textCancel?: string;
    title?: string;
    validationSchema: any;
    width?: number;
    fieldItems: {
      name: string;
      label: string;
      component: any;
      componentProps?: Record<string, unknown>;
    }[][];
  };
};

const PortalTemplate = (props: Props) => {
  // !State
  const { roles } = useAppContext();
  const {
    title = 'Tiêu đề',
    addNewPermission,
    exportPermission,
    importPermission,
    isAddNew = false,
    exportUrl,
    importUrl,
    onUploadSuccess,
    isExport,
    fileName = `file_${formatDate(new Date())}`,
  } = props.header;
  const { api, columns, queryKey } = props.table || {};
  const { filters } = props.filter || {};
  const {
    initialValues,
    apiCreateUrl,
    textCancel = 'Hủy',
    textConfirm = 'Tạo mới',
    title: titleModal = 'Tạo mới',
    validationSchema,
    fieldItems,
    width = 800,
  } = props.formModal || {};
  const canAccessPermission = (permission?: string) => !!permission && roles.includes(permission);
  const formModalRef = useRef<FormikProps<Record<string, unknown>>>(null);

  const fetchApi = useCallback((params: Record<string, unknown>) => api?.({ ...params, ...filters }), [api, filters]);
  const { open, shouldRender, toggle } = useToggleDialog();
  const {
    data,
    total,
    loading: loadingTable,
    page,
    pageSize,
    onPageChange,
    refresh,
  } = useTablePagination({
    fetchApi,
    defaultPageSize: 10,
    queryKey,
  });

  const { mutateAsync: createForm, isLoading: createFormLoading } = usePostApi({
    apiUrl: apiCreateUrl,
    message: 'Tạo mới thành công',
  });

  const { mutateAsync: exportFile, isLoading: isLoadingExportFile } = useExportFile();

  const onExport = async () => {
    await exportFile({
      url: exportUrl ?? '',
      params: filters,
      fileName,
    });
  };

  const onSubmit = async (values: Record<string, unknown>) => {
    try {
      await createForm(values);
      toggle();
      refresh();
    } catch (error) {
      console.error(error);
    }
  };
  //  !Render
  return (
    <Card
      styles={{
        body: {
          paddingTop: 0,
        },
      }}
      title={<Typography.Title level={4}>{title}</Typography.Title>}
      extra={
        <Flex align="center" justify="space-between">
          <Flex gap={8}>
            {isAddNew && canAccessPermission(addNewPermission) && (
              <Commons.Button icon={<PlusOutlined />} onClick={toggle}>
                Thêm mới
              </Commons.Button>
            )}
            {isExport && canAccessPermission(exportPermission) && (
              <Commons.Button
                type="default"
                icon={<UploadOutlined />}
                onClick={onExport}
                variant="outlined"
                loading={isLoadingExportFile}
                disabled={isLoadingExportFile}
              >
                Export
              </Commons.Button>
            )}
            {importUrl && canAccessPermission(importPermission) && (
              <Commons.UploadFile action={importUrl} text="Import" onUploadSuccess={onUploadSuccess} />
            )}
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap={16}>
        <Filter {...props.filter} loading={loadingTable} />
        <Table
          columns={columns}
          data={data}
          total={total}
          loading={loadingTable}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </Flex>
      {shouldRender && (
        <Commons.Modal
          open={open}
          onClose={toggle}
          title={titleModal}
          width={width}
          loading={createFormLoading}
          showFooter
          textCancel={textCancel}
          textConfirm={textConfirm}
          onConfirm={() => formModalRef.current?.submitForm()}
        >
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            innerRef={formModalRef}
            validationSchema={validationSchema}
          >
            {() => (
              <Form>
                <Row gutter={16}>
                  {fieldItems.map((col, colIndex) => (
                    <Col span={24 / fieldItems.length} key={colIndex}>
                      {col.map((field, fieldIndex) => (
                        <div key={fieldIndex} style={{ marginBottom: 16 }}>
                          <Field
                            name={field.name}
                            label={field.label}
                            component={field.component}
                            {...field.componentProps}
                          />
                        </div>
                      ))}
                    </Col>
                  ))}
                </Row>
              </Form>
            )}
          </Formik>
        </Commons.Modal>
      )}
    </Card>
  );
};

export default PortalTemplate;
