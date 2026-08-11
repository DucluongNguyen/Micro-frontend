// css-loader here is configured for named exports (each class becomes its
// own export, e.g. `export const row = '...'`), not a single default export
// object - `export =` + `import * as styles from '...'` is what matches
// that shape (see the matching import in Filter.tsx).
declare module '*.module.scss' {
  const classes: { readonly [className: string]: string };
  export = classes;
}
