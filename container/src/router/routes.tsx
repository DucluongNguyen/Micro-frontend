import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RemoteBoundary } from '../components/RemoteBoundary';
import { RequireAuth } from '../components/RequireAuth';
import Home from '../pages/Home';
import Login from '../pages/Login';
import AppLayout from '@/layouts/AppLayout';

// React.lazy + a typed ambient module (src/types/remotes.d.ts) gives full
// type checking on the remote's props, unlike importing an `any`-typed
// remote and passing it whatever props happen to compile.
const DashboardApp = lazy(() => import('Dashboard/App'));
const AboutApp = lazy(() => import('About/App'));
const ContactApp = lazy(() => import('Contact/App'));
const SettingApp = lazy(() => import('Setting/App'));
const InfoApp = lazy(() => import('Info/App'));

export const routes: RouteObject[] = [
  // Public - the only route reachable without a session. See RequireAuth.tsx.
  { path: '/login', element: <Login /> },
  {
    // Guards everything below: Home and every federated remote. A direct
    // visit to e.g. /dashboard/stats without a session redirects to /login
    // before AppLayout (or the remote it would have rendered) ever mounts.
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Home /> },
          // The trailing `/*` is what hands off everything past `/dashboard`
          // to the remote's own internal routing (see Dashboard/App's
          // useRoutes call) instead of the container having to know each
          // remote's nested page structure. Each remote decides its own
          // sub-routes; the container only owns the top-level mount point.
          {
            path: '/dashboard/*',
            element: (
              <RemoteBoundary>
                <DashboardApp />
              </RemoteBoundary>
            ),
          },
          {
            path: '/about/*',
            element: (
              <RemoteBoundary>
                <AboutApp />
              </RemoteBoundary>
            ),
          },
          {
            path: '/contact/*',
            element: (
              <RemoteBoundary>
                <ContactApp />
              </RemoteBoundary>
            ),
          },
          {
            path: '/setting/*',
            element: (
              <RemoteBoundary>
                <SettingApp />
              </RemoteBoundary>
            ),
          },
          {
            path: '/info/*',
            element: (
              <RemoteBoundary>
                <InfoApp />
              </RemoteBoundary>
            ),
          },
        ],
      },
    ],
  },
];
