import { Tag } from 'antd';
import React from 'react';

type Props = {
  status?: string;
};

export enum StatusType {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

const Status = (props: Props) => {
  // !State
  const { status = 'Active' } = props;

  const renderStatus = () => {
    switch (status) {
      case StatusType.ACTIVE:
        return <Tag color="success">Hoạt động</Tag>;
      case StatusType.APPROVED:
        return <Tag color="success">Đã phê duyệt</Tag>;
      case StatusType.INACTIVE:
        return <Tag color="error">Không hoạt động</Tag>;
      case StatusType.REJECTED:
        return <Tag color="error">Từ chối</Tag>;
      case StatusType.PENDING_APPROVAL:
        return <Tag color="warning">Chờ phê duyệt</Tag>;
      case StatusType.CANCELLED:
        return <Tag color="error">Hủy</Tag>;
      default:
        return ''; // Fallback for any other status
    }
  };
  // !Render
  return renderStatus();
};

export default Status;
