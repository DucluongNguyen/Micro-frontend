import { ConfigProvider, type ThemeConfig } from 'antd';
import { useRoutes } from 'react-router-dom';
import About from './pages/About';
import Mission from './pages/Mission';
import { AppProvider } from './contexts/AppContext';
import { QueryClient, QueryClientProvider } from 'react-query';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
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
  // Merge, don't replace: the container only ever sends `{ algorithm }`
  // (see RemoteBoundary.tsx) to sync dark/light mode - it doesn't know or
  // care about this remote's own `colorPrimary`. `theme ?? defaultTheme`
  // would drop `defaultTheme` entirely the moment a host theme is passed,
  // losing that color. Spreading `theme` after `defaultTheme` overlays just
  // the keys the host actually sends (`algorithm` here) on top of this
  // remote's own defaults. Standalone dev (no host, `theme` is undefined)
  // is unaffected - spreading `undefined` is a no-op.
  const resolvedTheme: ThemeConfig = { ...defaultTheme, ...theme };
  return (
    <ConfigProvider theme={resolvedTheme}>
      <QueryClientProvider client={client}>
        <AppProvider>
          <AboutRoutes />
        </AppProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
