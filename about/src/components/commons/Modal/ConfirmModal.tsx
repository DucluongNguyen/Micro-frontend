import { Modal, Button, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { Commons } from '..';

const { Text } = Typography;

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  content?: any;
  onCancel: () => void;
  onReject?: () => void;
  onConfirm: () => void;
  cancelText?: string;
  okText?: string;
  variantColor?: string;
  loading?: boolean;
  shouldRender?: boolean;
  children?: React.ReactNode;
  width?: number;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = 'Hủy yêu cầu',
  content,
  onCancel,
  onReject,
  onConfirm,
  cancelText = 'Cancel',
  okText = 'OK',
  variantColor='outlined',
  loading = false,
  shouldRender = false,
  children,
  width = 400,
}) => {
  if (!shouldRender) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable
      centered
      width={width}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
        <Text strong>{title}</Text>
      </div>
      {content && <div style={{ marginTop: 16 }}>{content}</div>}
      {children && <div style={{ marginTop: 16 }}>{children}</div>}

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'end',
          gap: 16,
        }}
      >
        <Commons.Button color="danger" variant={variantColor as any} onClick={onReject ?? onCancel}>
          {cancelText}
        </Commons.Button>
        <Commons.Button onClick={onConfirm} loading={loading}>
          {okText}
        </Commons.Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
