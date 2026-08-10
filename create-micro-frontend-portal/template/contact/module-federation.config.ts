/**
 * Module Federation wiring for this remote. Uses `@module-federation/enhanced`
 * to match the container - see container/base/module-federation.config.ts
 * for why mixing plugins between host and remotes is a bug source.
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

// requiredVersion MUST match what the container actually declares for the
// same package. The original portal-relationship declared react-router-dom
// as `^18.0.0` here (copy-pasted from the react/react-dom entries) even
// though react-router-dom is a v6 package and the container required
// `^6.0.0` - a real bug that silently breaks singleton sharing.
const sharedDependencies: Record<string, FederationSharedConfig> = {
  react: { singleton: true, eager: false, requiredVersion: '^18.3.1' },
  'react-dom': { singleton: true, eager: false, requiredVersion: '^18.3.1' },
  'react-router-dom': { singleton: true, eager: false, requiredVersion: '^6.28.0' },
  'react-redux': { singleton: true, eager: false, requiredVersion: '^9.2.0' },
};

// A function, not a plain object - see the identical comment in
// container/base/module-federation.config.ts. Reading process.env at
// module-evaluation time risks running before rspack.config.ts's
// `require('./load-env')`, depending on how the .ts config loader orders
// imports vs requires.
export function createModuleFederationConfig(): FederationConfig {
  return {
    name: 'Contact',
    filename: 'remoteEntry.js',
    exposes: {
      './App': './src/App.tsx',
      // Lets the container's sidebar render this remote's nested routes
      // without hardcoding them - see src/navigation.ts.
      './navigation': './src/navigation.ts',
    },
    remotes: {
      // Only declared when actually configured: this remote's exposed App
      // (src/App.tsx) deliberately does NOT import anything from the
      // container (see src/types/host.d.ts), so it never needs this to be
      // set. Declaring a `remotes` entry with an empty URL is what produces
      // the cryptic "object null is not iterable" crash deep inside
      // rspack's Module Federation plugin - safer to just omit the key.
      ...(process.env.URL_HOST_CONTAINER ? { container: process.env.URL_HOST_CONTAINER } : {}),
    },
    shared: sharedDependencies,
    // See the matching comment in container/base/module-federation.config.ts:
    // disable @module-federation/enhanced's automatic .d.ts generation
    // (forked tsc, fails with opaque TYPE-001 errors on strict tsconfigs)
    // in favor of the hand-written ambient types this base already ships.
    dts: false,
  };
}
