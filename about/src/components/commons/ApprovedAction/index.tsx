import { FormAction, useFormAction } from '@/hooks/useFormAction';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Col, Flex, Row } from 'antd';
import { Commons } from '..';
import useToggleDialog from '@/hooks/useToggleDialog';
import { Field, Form, Formik, type FormikProps } from 'formik';
import { useGetApi, usePutApi } from '@/hooks/useApi';
import { useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import RenderTitleAction from '@/components/RenderTitleAction';
import { useAppContext } from '@/contexts/AppContext';

type Props<T> = {
  record: T;
  fieldItems: any[];
  titleModal: string;
  validationSchema: any;
  width?: number;
  textCancel?: string;
  textConfirm?: string;
  apiEditUrl?: string;
  apiDetailUrl?: string;
  isViewPermission: string;
  isEditPermission: string;
};

const ApprovedAction = <T,>(props: Props<T>) => {
  // !State
  const {
    record,
    fieldItems,
    titleModal,
    validationSchema,
    width = 800,
    textCancel = 'Hủy',
    textConfirm = 'Xác nhận',
    apiEditUrl,
    apiDetailUrl,
    isViewPermission,
    isEditPermission,
  } = props;
  const { action, setAction } = useFormAction();
  const { open, shouldRender, toggle } = useToggleDialog();
  const recordData = record as Record<string, unknown>;
  const recordId = recordData['id'];
  const [initValues, setInitValues] = useState<Record<string, unknown>>({});
  const formModalRef = useRef<FormikProps<Record<string, unknown>>>(null);
  const queriesClient = useQueryClient();
  const { roles } = useAppContext();

  const { isLoading } = useGetApi(
    {
      apiUrl: `${apiDetailUrl}/${recordId}`,
      queryKey: [recordId],
      message: '',
    },
    {
      enabled: !!action && !!recordId,
      onSuccess: (data: Record<string, unknown>) => {
        setInitValues(data);
      },
    },
  );

  const { mutateAsync: Editform, isLoading: isEditLoading } = usePutApi({
    apiUrl: `${apiEditUrl}/${recordId}`,
    message: 'Cập nhật thành công',
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    try {
      await Editform(values);
      toggle();

      queriesClient.refetchQueries(['table-about'], { active: true });
    } catch (error) {
      console.error(error);
    }
  };

  // !Render
  return (
    <Flex gap={8}>
      {roles?.includes(isViewPermission) && (
        <Commons.Button
          type="primary"
          shape="circle"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setAction(FormAction.EDIT);
            toggle();
          }}
        />
      )}

      {roles?.includes(isEditPermission) && (
        <Commons.Button
          type="default"
          shape="circle"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setAction(FormAction.VIEW);
            toggle();
          }}
        />
      )}

      {shouldRender && (
        <Commons.Modal
          open={open}
          onClose={toggle}
          title={<RenderTitleAction action={action} title={titleModal} />}

          width={width}
          loading={isEditLoading}
          showFooter
          textCancel={textCancel}
          textConfirm={action === FormAction.EDIT ? textConfirm : 'Chỉnh sửa'}

          onConfirm={
            action === FormAction.VIEW ? () => setAction(FormAction.EDIT) : () => formModalRef.current?.submitForm()
          }
        >
          {isLoading ? (
            <Commons.Loading />
          ) : (
            <Formik
              initialValues={initValues}
              onSubmit={onSubmit}
              validationSchema={validationSchema}
              enableReinitialize
              innerRef={formModalRef}
            >
              {() => (
                <Form>
                  <Row gutter={16}>
                    {fieldItems.map((col, colIndex) => (
                      <Col span={24 / fieldItems.length} key={colIndex}>
                        {col.map((field: any, fieldIndex: number) => (
                          <div key={fieldIndex} style={{ marginBottom: 16 }}>
                            <Field
                              name={field.name}
                              label={field.label}
                              component={field.component}
                              {...field.componentProps}
                              disabled={action === FormAction.VIEW}
                            />
                          </div>
                        ))}
                      </Col>
                    ))}
                  </Row>
                </Form>
              )}
            </Formik>
          )}
        </Commons.Modal>
      )}
    </Flex>
  );
};

export default ApprovedAction;
