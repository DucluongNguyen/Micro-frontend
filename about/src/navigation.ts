/**
 * Exposed as `About/navigation` so the container's sidebar can render this
 * remote's nested routes without hardcoding them - see
 * portal-container/base/src/hooks/useRemoteNavigation.ts. Keep this in sync
 * with the routes defined in App.tsx.
 */
export interface RemoteNavItem {
  /** Path relative to wherever this remote is mounted - '' for the index route. */
  path: string;
  label: string;
  /**
   * Name of an `@ant-design/icons` component (e.g. 'InfoCircleOutlined'). A
   * string, not the component itself - see the matching comment in
   * portal-relationship/base/src/navigation.ts.
   */
  icon?: string;
}

export const navigation: RemoteNavItem[] = [
  { path: '', label: 'Phê duyệt', icon: 'InfoCircleOutlined' },
  { path: 'mission', label: 'Chờ phê duyệt', icon: 'AimOutlined' },
];
