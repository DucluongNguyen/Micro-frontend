import { DownloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';
import { Commons } from '..';
import { useToast } from '@/hooks/useToast';

type UploadFileT = {
  text?: string;
  action: string;
  onUploadSuccess?: () => void;
  message?: string;
  name?: string;
} & UploadProps;

const UploadFile = (uploadProps: UploadFileT) => {
  // !State
  const {
    text,
    action,
    onUploadSuccess,
    message = 'Import danh sách thành công',
    name = 'file',
    ...uploadPropsRest
  } = uploadProps;
  const { showMessage } = useToast();

  const props: UploadProps = {
    action,
    listType: 'picture',
    name,
    showUploadList: false,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    onChange: ({ file }) => {
      if (file.status === 'done') {
        showMessage({ type: 'success', content: message });
        if (onUploadSuccess) onUploadSuccess();
      } else if (file.status === 'error') {
        showMessage({ type: 'error', content: 'Có lỗi xảy ra khi tải lên!' });
      }
    },
  };

  // !Render
  return (
    <Upload {...props} {...uploadPropsRest}>
      <Commons.Button icon={<DownloadOutlined />} type="default">
        {text}
      </Commons.Button>
    </Upload>
  );
};

export default UploadFile;
