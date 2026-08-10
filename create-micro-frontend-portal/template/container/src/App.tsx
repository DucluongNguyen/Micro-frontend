import { useDeferredValue, useMemo } from 'react';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import { useLocation, useRoutes } from 'react-router-dom';
import { NavigationProgressBar } from './components/NavigationProgressBar';
import { useStoreTheme } from './store/store';
import { routes } from './router/routes';

export default function App() {
  const { componentSize, theme, mode } = useStoreTheme();

  // `theme` in the store is user-customizable overrides (tokens etc., see
  // themeSlice.ts) kept separate from `mode` so toggling dark/light never
  // clobbers those. The algorithm is computed here, not stored, since it's
  // fully derived from `mode` - storing it too would just be another thing
  // that could drift out of sync with it.
  const resolvedTheme = useMemo(
    () => ({ ...theme, algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }),
    [theme, mode],
  );

  // `useRoutes` takes an optional location override. By feeding it a
  // *deferred* copy of the real location instead of the real one, React
  // keeps rendering the previous route's tree - even a suspended remote
  // chunk mid-download doesn't unmount it - while it prepares the new one
  // in the background. `isPending` (location !== deferredLocation) is true
  // for that entire window, whether the transition is instant (same-remote
  // route change) or waiting on network (first visit to a remote's JS
  // chunk). This is what gives every navigation a loading state without
  // ever showing a blank screen or an unwanted Suspense fallback flash for
  // in-app transitions.
  //
  // This only covers in-app navigation. A hard reload/direct link still has
  // no "previous tree" to keep showing, so that case falls through to
  // RemoteBoundary's own Suspense fallback (see components/RemoteBoundary.tsx).
  const location = useLocation();
  const deferredLocation = useDeferredValue(location);
  const isPending = location !== deferredLocation;
  const element = useRoutes(routes, deferredLocation);

  return (
    <ConfigProvider componentSize={componentSize} theme={resolvedTheme}>
      <AntdApp>
        <NavigationProgressBar active={isPending} />
        <div
          style={{
            opacity: isPending ? 0.6 : 1,
            transition: isPending ? 'opacity 0.15s ease-in 0.1s' : 'opacity 0.15s ease-out',
            pointerEvents: isPending ? 'none' : undefined,
          }}
        >
          {element}
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}
