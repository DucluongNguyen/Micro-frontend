import React, { ReactNode, useState } from 'react';
import { Commons } from '..';
import { Col, Flex, Row } from 'antd';
import { ROLE } from '@/contants/enum';
import { useShowModal } from '@/contexts/ConfigContext';
import { Form, Formik } from 'formik';

type Props = {
  children: (disabledForm: boolean) => ReactNode;
  open: boolean;
  toggle: () => void;
  shouldRender: boolean;
  width: number;
  role: ROLE[];
  initialValues: any;
  onSubmit: (values: any) => void;
  disabled?: boolean;
};

const ModalWithRole = (props: Props) => {
  // !State
  const {
    children,
    open,
    toggle,
    shouldRender,
    width = 600,
    role = [],
    initialValues,
    onSubmit,
    disabled = false,
  } = props;
  const { toggleApproveModal, toggleCancelModal, toggleRejectModal } =
    useShowModal();
  const [disabledForm, setDisabledForm] = useState(disabled);

  // !Render
  return (
    <Commons.Modal
      open={open}
      onClose={toggle}
      shouldRender={shouldRender}
      title="Phê duyệt hạn mức vay tổng"
      width={width}
      onConfirm={toggle}
    >
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ handleSubmit }) => (
          <Form>
            {children(disabledForm)}
            <Row>
              <Col xs={24}>
                <Flex justify="end" gap={8}>
                  {role?.includes(ROLE.CHECKER) && (
                    <>
                      <Commons.Button
                        color="danger"
                        variant="solid"
                        onClick={toggleRejectModal}
                      >
                        Từ chối
                      </Commons.Button>
                      <Commons.Button onClick={toggleApproveModal}>
                        Phê duyệt
                      </Commons.Button>
                    </>
                  )}
                  {role?.includes(ROLE.MAKER) && (
                    <>
                      <Commons.Button
                        color="danger"
                        variant="solid"
                        onClick={toggleCancelModal}
                      >
                        Hủy yêu cầu
                      </Commons.Button>
                      {disabledForm ? (
                        <Commons.Button
                          onClick={() => {
                            setDisabledForm(false);
                          }}
                        >
                          Chỉnh sửa
                        </Commons.Button>
                      ) : (
                        <Commons.Button onClick={() => handleSubmit()}>
                          Lưu
                        </Commons.Button>
                      )}
                    </>
                  )}
                </Flex>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Commons.Modal>
  );
};

export default ModalWithRole;
