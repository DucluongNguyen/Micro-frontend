import { useEffect, useState } from 'react';

/**
 * One remote's nested-route metadata, resolved to paths the container can
 * actually link to (its own mount path + the remote's relative sub-path).
 */
export interface RemoteNavSection {
  /** Federation key, e.g. 'Dashboard'. */
  key: string;
  /** Top-level mount path in the container's router, e.g. '/dashboard'. */
  mountPath: string;
  /** Section label shown in the sidebar group header. */
  label: string;
  /** True if the remote's `./navigation` module failed to load (remote down / not built yet). */
  failed: boolean;
  /** Icon name for the section header - taken from its first (index) item's icon. */
  icon?: string;
  items: { path: string; label: string; icon?: string; fullPath: string }[];
}

interface RemoteDefinition {
  key: string;
  mountPath: string;
  label: string;
  importNavigation: () => Promise<{ navigation: { path: string; label: string; icon?: string }[] }>;
}

// Mirrors src/router/routes.tsx's mount points. Kept as an explicit list
// (like module-federation.config.ts's REMOTE_DEFINITIONS) rather than
// derived from the router config, so a remote can be wired up here even
// before its route/lazy import exists.
const REMOTES: RemoteDefinition[] = [
  {
    key: 'Dashboard',
    mountPath: '/dashboard',
    label: 'Dashboard',
    importNavigation: () => import('Dashboard/navigation'),
  },
  {
    key: 'About',
    mountPath: '/about',
    label: 'About',
    importNavigation: () => import('About/navigation'),
  },
  {
    key: 'Contact',
    mountPath: '/contact',
    label: 'Contact',
    importNavigation: () => import('Contact/navigation'),
  },
  // {
  //   key: 'Setting',
  //   mountPath: '/setting',
  //   label: 'Setting',
  //   importNavigation: () => import('Setting/navigation'),
  // },
  // {
  //   key: 'Info',
  //   mountPath: '/info',
  //   label: 'Info',
  //   importNavigation: () => import('Info/navigation'),
  // },
];

/**
 * Dynamically loads each remote's exposed `./navigation` module so the
 * sidebar can always show their nested routes, without the container
 * hardcoding what those routes are.
 *
 * Each remote is fetched independently and failures are isolated per-remote:
 * one remote being offline or not yet built must not blank out the rest of
 * the sidebar (or crash it) - it just renders that section as unavailable.
 */
export function useRemoteNavigation(): RemoteNavSection[] {
  const [sections, setSections] = useState<RemoteNavSection[]>(() =>
    REMOTES.map((remote) => ({
      key: remote.key,
      mountPath: remote.mountPath,
      label: remote.label,
      failed: false,
      items: [],
    })),
  );

  useEffect(() => {
    let cancelled = false;

    REMOTES.forEach((remote) => {
      remote
        .importNavigation()
        .then((mod) => {
          if (cancelled) return;
          setSections((prev) =>
            prev.map((section) =>
              section.key === remote.key
                ? {
                    ...section,
                    failed: false,
                    icon: mod.navigation[0]?.icon,
                    items: mod.navigation.map((item) => ({
                      ...item,
                      fullPath: item.path ? `${remote.mountPath}/${item.path}` : remote.mountPath,
                    })),
                  }
                : section,
            ),
          );
        })
        .catch((error: unknown) => {
          // eslint-disable-next-line no-console -- deliberate: surfaces which remote is unreachable during dev.
          console.warn(`[useRemoteNavigation] Failed to load navigation for "${remote.key}":`, error);
          if (cancelled) return;
          setSections((prev) =>
            prev.map((section) => (section.key === remote.key ? { ...section, failed: true } : section)),
          );
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return sections;
}
