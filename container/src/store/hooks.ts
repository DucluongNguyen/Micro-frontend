import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Typed wrappers around the plain react-redux hooks - use these everywhere
// instead of the bare `useDispatch`/`useSelector` so state shape is checked.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
