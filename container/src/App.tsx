import { ConfigProvider, App as AntdApp } from 'antd';
import { useRoutes } from 'react-router-dom';
import { useStoreTheme } from './store/store';
import { routes } from './router/routes';

export default function App() {
  const { componentSize, theme } = useStoreTheme();
  const element = useRoutes(routes);

  return (
    <ConfigProvider componentSize={componentSize} theme={theme}>
      <AntdApp>{element}</AntdApp>
    </ConfigProvider>
  );
}
