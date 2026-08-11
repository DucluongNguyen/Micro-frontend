import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

interface CommonLoadingProps {
  tip?: string; // text hiển thị dưới spinner
  fullscreen?: boolean; // true: chiếm toàn màn hình
  size?: 'small' | 'default' | 'large';
}

const Loading: React.FC<CommonLoadingProps> = ({
  tip = 'Đang tải...',
  fullscreen = false,
  size = 'large',
}) => {
  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Spin size={size} tip={tip} />
        {tip && <Text type="secondary">{tip}</Text>}
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Spin size={size} />
      {tip && <Text type="secondary">{tip}</Text>}
    </div>
  );
};

export default Loading;
