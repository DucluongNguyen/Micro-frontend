/**
 * Exposed as `Dashboard/navigation` so the container's sidebar can render
 * this remote's nested routes without hardcoding them - see
 * portal-container/base/src/hooks/useRemoteNavigation.ts. Keep this in sync
 * with the routes defined in App.tsx; nothing enforces they match
 * automatically (see the README for the `dts` auto-generation upgrade path
 * that would).
 */
export interface RemoteNavItem {
  /** Path relative to wherever this remote is mounted - '' for the index route. */
  path: string;
  label: string;
  /**
   * Name of an `@ant-design/icons` component (e.g. 'AppstoreOutlined'). A
   * string, not the component itself: this module stays plain serializable
   * data with no React/antd import, and the container - which already
   * depends on @ant-design/icons for its own shell - resolves the name to a
   * component (see portal-container/base/src/layouts/AppLayout.tsx).
   */
  icon?: string;
}

export const navigation: RemoteNavItem[] = [
  { path: '', label: 'Overview', icon: 'AppstoreOutlined' },
  { path: 'stats', label: 'Stats', icon: 'BarChartOutlined' },
  { path: 'performance', label: 'Performance', icon: 'ThunderboltOutlined' },
];
