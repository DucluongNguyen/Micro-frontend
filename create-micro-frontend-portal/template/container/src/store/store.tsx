import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import { useAppSelector } from './hooks';

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

// These two types are the whole point of exposing `./store` from the
// container: remotes import THEM (via src/types/host.d.ts on the remote
// side), not the store instance itself, so `useAppSelector` stays type-safe
// end to end instead of returning `any` like the original setup did.
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

/** Convenience selector remotes can also import directly if desired. */
export function useStoreTheme() {
  return useAppSelector((state) => state.theme);
}

/**
 * Session state for RequireAuth (see src/components/RequireAuth.tsx) and
 * AppLayout's header. Deliberately container-only - remotes never read this
 * directly (see src/types/host.d.ts on the remote side): the container is
 * the single source of truth for "is the user allowed in at all", while each
 * remote is free to have its own finer-grained authorization if it needs it.
 */
export function useAuth() {
  return useAppSelector((state) => state.auth);
}
