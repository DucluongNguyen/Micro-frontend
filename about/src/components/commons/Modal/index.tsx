import React from 'react';
import { Divider, Modal as ModalAntd, Typography } from 'antd';
import { Commons } from '..';

interface CommonModalProps {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  width?: number | string;
  children?: React.ReactNode;
  destroyOnClose?: boolean;
  centered?: boolean;
  textCancel?: string;
  showFooter?: boolean;
  textConfirm?: string;
  onConfirm?: () => void;
  loading?: boolean;
  loadingReject?: boolean;
  loadingApprove?: boolean;
  onCancel?: () => void;
  isReject?: boolean;
  isApprove?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const Modal: React.FC<CommonModalProps> = ({
  open,
  onClose,
  title,
  width = 520,
  children,
  destroyOnClose = true,
  centered = true,
  showFooter = false,
  textCancel = '',
  textConfirm = '',
  onConfirm,
  loading = false,
  onCancel,
  isApprove,
  isReject,
  onApprove,
  onReject,
  loadingApprove,
  loadingReject,
}) => {
  return (
    <ModalAntd
      open={open}

      title={
        <Typography.Title level={5} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
      }
      onCancel={onClose}
      footer={
        showFooter ? (
          <>
            {isReject && (
              <Commons.Button color="red" variant="solid" onClick={onReject} loading={loadingReject}>
                Từ chối
              </Commons.Button>
            )}
            {isApprove && (
              <Commons.Button color="green" variant="solid" onClick={onApprove} loading={loadingApprove}>
                Phê duyệt
              </Commons.Button>
            )}
            {textCancel && (
              <Commons.Button color="danger" variant="outlined" onClick={onCancel ?? onClose}>
                {textCancel}
              </Commons.Button>
            )}

            {textConfirm && (
              <Commons.Button type="primary" onClick={onConfirm} loading={loading}>
                {textConfirm}
              </Commons.Button>
            )}
          </>
        ) : null
      }
      width={width}
      destroyOnClose={destroyOnClose}
      centered={centered}
      maskClosable={false}
    >
      <Divider style={{ marginTop: 12 }} />
      {children}
    </ModalAntd>
  );
};

export default Modal;
