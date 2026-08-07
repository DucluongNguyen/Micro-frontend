import { ConfigProvider, type ThemeConfig } from 'antd';
import { useRoutes } from 'react-router-dom';
import About from './pages/About';
import Mission from './pages/Mission';

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
 * `/about/*` (see portal-container/base/src/router/routes.tsx) - see the
 * matching comment in portal-relationship/base/src/App.tsx for how the
 * relative `useRoutes` pattern works both federated and standalone, and why
 * there's no local sub-nav Menu here (the container's sidebar already
 * renders these routes from this remote's exposed `./navigation` module).
 */
function AboutRoutes() {
  return useRoutes([
    { path: '/', element: <About /> },
    { path: 'mission', element: <Mission /> },
  ]);
}

export default function App({ theme }: RemoteAppProps) {
  return (
    <ConfigProvider theme={theme ?? defaultTheme}>
      <AboutRoutes />
    </ConfigProvider>
  );
}
