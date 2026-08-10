import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  locale: 'en' | 'vi';
  componentSize: 'small' | 'middle' | 'large';
  theme: ThemeConfig;
  mode: ThemeMode;
}

const MODE_STORAGE_KEY = 'container.theme-mode';

function persistMode(mode: ThemeMode) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // localStorage unavailable (e.g. private browsing) - the choice just
    // won't survive a reload, not worth failing over for that.
  }
}

// Read any previously chosen mode synchronously at module load, same
// pattern as authSlice's persisted session - without this the first paint
// would flash light before switching to a previously-picked dark mode.
// Falls back to the OS-level preference, then light, if nothing was saved.
function readStoredMode(): ThemeMode | null {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    return raw === 'light' || raw === 'dark' ? raw : null;
  } catch {
    return null;
  }
}

function prefersDarkOS(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

const initialState: ThemeState = {
  locale: 'en',
  componentSize: 'middle',
  theme: {},
  mode: readStoredMode() ?? (prefersDarkOS() ? 'dark' : 'light'),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<ThemeState['locale']>) {
      state.locale = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemeConfig>) {
      // Return a new state object instead of mutating `state.theme` in
      // place: antd's ThemeConfig contains readonly-array token types that
      // Immer's WritableDraft can't assign to when mutated directly.
      return { ...state, theme: action.payload };
    },
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      persistMode(action.payload);
    },
    toggleMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      persistMode(state.mode);
    },
  },
});

export const { setLocale, setTheme, setMode, toggleMode } = themeSlice.actions;
export default themeSlice.reducer;
