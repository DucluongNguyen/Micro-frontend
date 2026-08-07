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
            <Spin size="large" tip="Loading..." />
          </Flex>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
