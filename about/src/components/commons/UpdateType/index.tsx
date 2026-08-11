import { UPDATE_TYPE } from '@/contants/enum';
import { Tag } from 'antd';
import React from 'react';

type Props = {
  type: UPDATE_TYPE;
};

const UpdateType = (props: Props) => {
  const renderUpdateType = () => {
    switch (props.type) {
      case UPDATE_TYPE.IMPORT_FILE:
        return <Tag color="success">Import file</Tag>;
      case UPDATE_TYPE.NEW_UPDATE:
        return <Tag color="processing">Thêm mới</Tag>;
      case UPDATE_TYPE.OLD_UPDATE:
        return <Tag color="warning">Chỉnh sửa</Tag>;
      case UPDATE_TYPE.CLOSE:
        return <Tag color="error">Đóng</Tag>;
      case UPDATE_TYPE.INIT_DATA:
        return <Tag color="default">Khởi tạo dữ liệu</Tag>;
      case UPDATE_TYPE.CANCEL_UPDATE:
        return <Tag color="error">Hủy liên kết</Tag>;
      default:
        return <Tag color="default">Khác</Tag>;
    }
  };
  return <>{renderUpdateType()}</>;
};

export default UpdateType;
