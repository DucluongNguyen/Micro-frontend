import { useMemo } from 'react';
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
  const from = `${location.pathname}${location.search}`;

  // `<Navigate>` re-runs its internal redirect effect whenever its `state`
  // prop changes identity - a literal `{ from }` object is a *new* object
  // every render. That's harmless when this component unmounts right after
  // the first redirect (the old behavior), but App.tsx now renders routes
  // against a `useDeferredValue`'d location so this component can stay
  // mounted for a few extra renders while the transition to /login settles.
  // Without memoizing here, each of those renders creates a new `state`
  // object, which re-fires the redirect, which changes the location again,
  // which never lets the deferred value catch up - "Maximum update depth
  // exceeded" from an effect that's redirecting in an infinite loop.
  // Memoizing on `from` keeps the object reference stable across renders
  // that don't actually change the redirect target.
  const state = useMemo(() => ({ from }), [from]);

  if (!token) {
    return <Navigate to="/login" replace state={state} />;
  }

  return <Outlet />;
}
