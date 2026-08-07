import { ConfigProvider, type ThemeConfig } from 'antd';
import { useRoutes } from 'react-router-dom';
import Overview from './pages/Overview';
import Stats from './pages/Stats';
import Performance from './pages/Performance';

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
 * `/dashboard/*` (see portal-container/base/src/router/routes.tsx) and has
 * no idea "stats" exists - add, rename or remove sub-routes here freely
 * without ever touching the container.
 *
 * No local sub-nav Menu here: the container's sidebar already renders these
 * nested routes (via this remote's exposed `./navigation` module - see
 * src/navigation.ts), so a second in-remote nav would just duplicate it.
 *
 * `useRoutes` resolves relative to wherever this component is mounted, so
 * the exact same routes work both federated (`/dashboard`, `/dashboard/stats`)
 * and standalone via bootstrap.tsx (`/`, `/stats`).
 */
function DashboardRoutes() {
  return useRoutes([
    { path: '/', element: <Overview /> },
    { path: 'stats', element: <Stats /> },
    { path: 'performance', element: <Performance /> },
  ]);
}

export default function App({ theme }: RemoteAppProps) {
  return (
    <ConfigProvider theme={theme ?? defaultTheme}>
      <DashboardRoutes />
    </ConfigProvider>
  );
}
