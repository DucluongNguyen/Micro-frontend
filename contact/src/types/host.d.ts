/**
 * Typed contract for the container's exposed `./store` module (see
 * container/base/src/store/store.ts).
 *
 * Nothing in this remote actually imports 'container/store' by default -
 * App.tsx receives host state via props instead, so this app keeps working
 * when run standalone (see bootstrap.tsx). Kept here as a documented,
 * *properly typed* example for the rare case a deeply nested component
 * genuinely needs to read host state directly, replacing the
 * `any`-typed declare module the original portal-relationship used.
 */
declare module 'container/store' {
  export interface ThemeState {
    locale: 'en' | 'vi';
    componentSize: 'small' | 'middle' | 'large';
    theme: import('antd').ThemeConfig;
  }

  export function useStoreTheme(): ThemeState;
}
