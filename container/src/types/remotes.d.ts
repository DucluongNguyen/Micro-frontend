/**
 * Hand-written typed contract for the `Dashboard` remote, exposed from
 * remote/src/App.tsx (see portal-relationship/base).
 *
 * This mirrors the *actual* props/exports of the remote, so the container
 * gets real type checking instead of the `any`-typed ambient declarations
 * the original portal-relationship/@types/remote-modules.d.ts used.
 *
 * Each remote now owns its own nested routing internally (see the
 * `useRoutes` call in its App.tsx) instead of the container telling it
 * which "view" to render via props - so the only prop left here is the
 * optional host theme override.
 *
 * For larger federations, prefer generating this automatically with
 * `@module-federation/enhanced`'s dts plugin (`dts: { generateTypes: true }`
 * in module-federation.config.ts on both sides) so the contract can never
 * drift out of sync with the remote's real source - this hand-written file
 * is the zero-infrastructure fallback for a base/template project.
 */
declare module 'Dashboard/App' {
  export interface RemoteAppProps {
    theme?: import('antd').ThemeConfig;
  }

  const RemoteApp: React.ComponentType<RemoteAppProps>;
  export default RemoteApp;
}

/**
 * Same contract shape as Dashboard, exposed from ../about/src/App.tsx.
 */
declare module 'About/App' {
  export interface RemoteAppProps {
    theme?: import('antd').ThemeConfig;
  }

  const RemoteApp: React.ComponentType<RemoteAppProps>;
  export default RemoteApp;
}

/**
 * Same contract shape as Dashboard, exposed from ../contact/src/App.tsx.
 */
declare module 'Contact/App' {
  export interface RemoteAppProps {
    theme?: import('antd').ThemeConfig;
  }

  const RemoteApp: React.ComponentType<RemoteAppProps>;
  export default RemoteApp;
}

/**
 * Nested-route metadata each remote exposes for the sidebar - see
 * src/hooks/useRemoteNavigation.ts and each remote's own src/navigation.ts.
 * `path` is relative to wherever the remote is mounted ('' = index route).
 */
declare module 'Dashboard/navigation' {
  export interface RemoteNavItem {
    path: string;
    label: string;
    /** Name of an `@ant-design/icons` component - see AppLayout.tsx's ICONS map. */
    icon?: string;
  }
  export const navigation: RemoteNavItem[];
}

declare module 'About/navigation' {
  export interface RemoteNavItem {
    path: string;
    label: string;
    icon?: string;
  }
  export const navigation: RemoteNavItem[];
}

declare module 'Contact/navigation' {
  export interface RemoteNavItem {
    path: string;
    label: string;
    icon?: string;
  }
  export const navigation: RemoteNavItem[];
}
