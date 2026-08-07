import { Suspense, type ReactNode } from 'react';
import { Flex, Spin } from 'antd';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Wrap every federated remote render with this: it combines Suspense (for
 * the async `React.lazy(() => import('remote/App'))` load) with an
 * ErrorBoundary (for both load failures and render-time crashes inside the
 * remote). Use this instead of scattering separate loading/error handling
 * per route.
 */
export function RemoteBoundary({ children }: { children: ReactNode }) {
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
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
