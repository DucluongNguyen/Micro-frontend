import { message } from 'antd';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface ShowMessageOptions {
  content: string;
  type?: MessageType;
  duration?: number;
}

export const useToast = () => {
  const showMessage = ({ content, type = 'info', duration = 2 }: ShowMessageOptions) => {
    message[type](content, duration);
  };

  return { showMessage };
};
