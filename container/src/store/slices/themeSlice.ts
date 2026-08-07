import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeConfig } from 'antd';

export interface ThemeState {
  locale: 'en' | 'vi';
  componentSize: 'small' | 'middle' | 'large';
  theme: ThemeConfig;
}

const initialState: ThemeState = {
  locale: 'en',
  componentSize: 'middle',
  theme: {},
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
  },
});

export const { setLocale, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
