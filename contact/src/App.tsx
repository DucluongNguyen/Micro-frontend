import { ConfigProvider, type ThemeConfig } from 'antd';
import { useRoutes } from 'react-router-dom';
import Contact from './pages/Contact';
import Form from './pages/Form';

export interface RemoteAppProps {
  /**
   * Optional theme override supplied by the host shell. Falls back to a
   * local default so this component still renders correctly when run
   * standalone (no host present) - see bootstrap.tsx.
   */
  theme?: ThemeConfig;
}

const defaultTheme: ThemeConfig = {
  token: { colorPrimary: '#1677ff' },
};

/**
 * This remote owns its own nested routing. The container only mounts it at
 * `/contact/*` (see portal-container/base/src/router/routes.tsx) - see the
 * matching comment in portal-relationship/base/src/App.tsx for how the
 * relative `useRoutes` pattern works both federated and standalone, and why
 * there's no local sub-nav Menu here (the container's sidebar already
 * renders these routes from this remote's exposed `./navigation` module).
 */
function ContactRoutes() {
  return useRoutes([
    { path: '/', element: <Contact /> },
    { path: 'form', element: <Form /> },
  ]);
}

export default function App({ theme }: RemoteAppProps) {
  return (
    <ConfigProvider theme={theme ?? defaultTheme}>
      <ContactRoutes />
    </ConfigProvider>
  );
}
