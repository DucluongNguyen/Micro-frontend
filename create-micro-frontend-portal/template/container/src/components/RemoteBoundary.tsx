import { cloneElement, Suspense, type ReactElement } from 'react';
import { Flex, Spin, theme as antdTheme, type ThemeConfig } from 'antd';
import { useStoreTheme } from '@/store/store';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Wrap every federated remote render with this: it combines Suspense (for
 * the async `React.lazy(() => import('remote/App'))` load) with an
 * ErrorBoundary (for both load failures and render-time crashes inside the
 * remote). Use this instead of scattering separate loading/error handling
 * per route.
 */
export function RemoteBoundary({ children }: { children: ReactElement<{ theme?: ThemeConfig }> }) {
  // Each remote is a *separate* React tree loaded via Module Federation -
  // it has its own antd/ConfigProvider instance, not the same React Context
  // as the container's. antd v5's usual "nested ConfigProvider inherits the
  // parent's theme automatically" doesn't apply across that boundary, so
  // the container's dark-mode toggle (see App.tsx) never reached remotes on
  // its own: each remote kept rendering its own light-mode default
  // (`defaultTheme` in the remote's own App.tsx) while the *page* behind it
  // had already gone dark - near-black default antd text sitting on a
  // near-black container background, i.e. content that's technically
  // there but effectively invisible.
  //
  // Every remote's `App` component already accepts an optional `theme` prop
  // for exactly this ("host shell" override - see each remote's own
  // RemoteAppProps). `cloneElement` injects the container's current
  // algorithm into that prop here, in the one place all federated remotes
  // already pass through, instead of every route in routes.tsx having to
  // thread it through by hand.
  const { mode } = useStoreTheme();
  const hostTheme: ThemeConfig = { algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm };
  const childWithTheme = cloneElement(children, { theme: hostTheme });

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', minHeight: 240 }}>
            {/* antd v5: `tip` only renders when Spin either wraps content
                ("nest" pattern) or is `fullscreen` - passing `tip` to a
                bare, childless <Spin> is silently ignored and warns. A
                fullscreen overlay is too heavy for a boundary that only
                covers one panel of the layout, so nest it around an empty
                placeholder sized to the same minHeight instead. */}
            <Spin size="large" tip="Loading...">
              <div style={{ width: 200, height: 120 }} />
            </Spin>
          </Flex>
        }
      >
        {childWithTheme}
      </Suspense>
    </ErrorBoundary>
  );
}
