/**
 * Module Federation wiring for the container (host), kept separate from
 * rspack.config.ts so the federation contract (name / exposes / remotes /
 * shared) is easy to read and diff on its own.
 *
 * Both this app and the remote base use `@module-federation/enhanced`
 * consistently. Mixing the plain `rspack.container.ModuleFederationPlugin`
 * on one side with the enhanced plugin on the other (as the original
 * portal-container / portal-relationship folders did) is a common source of
 * runtime-only bugs, since the enhanced runtime injects extra federation
 * bootstrap code that the plain plugin does not.
 */

export interface FederationSharedConfig {
  singleton?: boolean;
  eager?: boolean;
  requiredVersion?: string;
}

export interface FederationConfig {
  name: string;
  filename: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, FederationSharedConfig>;
  dts?: boolean;
}

// Keep the shared React ecosystem singleton and pinned to the exact range
// installed in package.json. `requiredVersion` here must match the actual
// installed range on BOTH the container and every remote - a mismatch
// (e.g. remote declaring ^18.0.0 for react-router-dom v6) silently forces
// duplicate copies to load at runtime.
const sharedDependencies: Record<string, FederationSharedConfig> = {
  react: { singleton: true, eager: false, requiredVersion: '^18.3.1' },
  'react-dom': { singleton: true, eager: false, requiredVersion: '^18.3.1' },
  'react-router-dom': { singleton: true, eager: false, requiredVersion: '^6.28.0' },
  'react-redux': { singleton: true, eager: false, requiredVersion: '^9.2.0' },
};

// Every remote the container knows how to consume. Add a new remote by
// adding one entry here, one `declare module` block in
// src/types/remotes.d.ts, and one env var in .env.development/.env.production
// - nowhere else.
//
// `key` must match the `name` the remote registers itself under in its own
// module-federation.config.ts (case-sensitive).
const REMOTE_DEFINITIONS: { key: string; envVar: string }[] = [
  { key: 'Dashboard', envVar: 'URL_HOST_DASHBOARD' },
  { key: 'About', envVar: 'URL_HOST_ABOUT' },
  { key: 'Contact', envVar: 'URL_HOST_CONTACT' },
];

// A function, not a plain object: `process.env.*` must be read *after*
// rspack.config.ts has required ./load-env. Exporting a static object here
// would read process.env at module-evaluation time, and depending on how the
// config loader (ts-node/jiti) orders `import` vs `require`, that can run
// before load-env.js populates process.env - silently producing an empty
// remote URL and a cryptic Module Federation crash ("object null is not
// iterable") deep inside rspack's internals. Wrapping it in a function that's
// only called once rspack.config.ts is ready sidesteps that ordering problem
// entirely.
export function createModuleFederationConfig(): FederationConfig {
  const remotes: Record<string, string> = {};

  for (const { key, envVar } of REMOTE_DEFINITIONS) {
    const url = process.env[envVar];
    if (url) {
      remotes[key] = url;
    } else {
      // Deliberately a warning, not a throw: with several remotes wired up,
      // forcing every single one to be configured just to run the container
      // locally (e.g. against only one remote you're actively developing) is
      // too rigid. If src/router/routes.tsx still has a static
      // `import('X/App')` for a remote that got skipped here, the *build*
      // will fail with a clear "Module not found: Can't resolve 'X/App'"
      // error - which is the right failure mode (caught before deploy, with
      // an actionable message) rather than the cryptic "object null is not
      // iterable" crash an empty URL produces deep inside rspack's Module
      // Federation plugin. To actually run the container against a subset of
      // remotes, remove the corresponding route(s) from routes.tsx too.
      // eslint-disable-next-line no-console
      console.warn(`[module-federation] ${envVar} is not set - skipping remote "${key}".`);
    }
  }

  return {
    name: 'container',
    filename: 'remoteEntry.js',
    exposes: {
      // Expose typed hooks/selectors only - never the raw store instance -
      // see src/store/store.tsx. Keeps remotes decoupled from container
      // internals and lets TypeScript check the shared surface.
      './store': './src/store/store.tsx',
    },
    remotes,
    shared: sharedDependencies,
    // @module-federation/enhanced auto-generates .d.ts for exposed/consumed
    // modules by forking `tsc` in the background (the "dts-plugin"). It's a
    // nice upgrade path (see the README), but it's an extra moving part that
    // needs its own working tsconfig/type-check pass and commonly fails with
    // opaque TYPE-001 errors on strict configs like this one's. This base
    // uses hand-written ambient types instead (src/types/remotes.d.ts), so
    // turn the automatic generation off rather than fighting it.
    dts: false,
  };
}
