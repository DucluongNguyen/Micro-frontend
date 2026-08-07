import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/store';

/**
 * Route guard: wraps the entire authenticated route tree (AppLayout + Home +
 * every federated remote - see src/router/routes.tsx) so none of it is
 * reachable, not even by typing a remote's URL directly, without a session.
 * `/login` is the only route registered outside this guard.
 *
 * Unauthenticated visits are redirected to /login with the originally
 * requested path in navigation state, so Login.tsx can send the user back
 * to where they meant to go instead of always landing on "/".
 */
export function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}
