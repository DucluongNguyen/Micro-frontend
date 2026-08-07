# remote-base

A minimal, best-practice base for a **remote** in a Module Federation
micro-frontend architecture, in TypeScript. Built by studying the existing
`portal-relationship` app and fixing the issues that had crept into it - see
"What's different from portal-relationship" below.

It exposes one component (`Dashboard/App`) that runs both federated into a
host (see the sibling `portal-container/base`) and **standalone**, with no
host running at all. It owns two nested routes of its own - `/` (Overview)
and `/stats` (Stats) - which the container knows nothing about; it only
mounts this remote at `/dashboard/*`. See "Nested routing" below.

## Quickstart

```bash
npm install
npm start          # http://localhost:3009, runs completely standalone
```

To see it federated into the container, also run `portal-container/base`
(`npm start`, port 3008) and open `http://localhost:3008/dashboard`.

## Scripts

Same set as `container-base`: `start`, `build[:env]`, `typecheck`, `lint`, `lint:fix`, `format`.

## Project layout

```
module-federation.config.ts   Federation contract, isolated from build config
rspack.config.ts              Build config; imports the above
src/
  index.ts                    Async entry boundary
  bootstrap.tsx                 Standalone dev harness (mounts <App /> directly)
  App.tsx                       The exposed component (Dashboard/App) - owns nested routing, accepts theme as a prop
  pages/Overview.tsx             `/` (or `/dashboard` when federated)
  pages/Stats.tsx                `/stats` (or `/dashboard/stats` when federated)
  config/env.ts                 Zod-validated runtime config
  types/
    env.d.ts                     process.env typings
    host.d.ts                    Typed (unused-by-default) contract for the container's `./store`
```

## What's different from `portal-relationship`

- **Full TypeScript** with the same strict `tsconfig.json` as the container base.
- **`@module-federation/enhanced` everywhere**, matching the container. The original
  `portal-relationship/rspack.config.ts` used the plain `rspack.container.ModuleFederationPlugin`
  while `portal-container` used the enhanced one - mixing them is a real bug source (see the container
  base's README for the crash this actually produces).
- **Fixed the `react-router-dom` shared-version bug.** The original declared `requiredVersion: '^18.0.0'`
  for `react-router-dom` (a v6 package) - copy-pasted from the react/react-dom entries. Fixed to `^6.28.0`,
  matching the container.
- **Runs standalone.** The original `App.tsx` did `import { useStoreTheme } from 'container/store'` at
  module scope, which means the module fails to even load unless a container is reachable at
  `URL_HOST_PORTAL_CONTAINER` - you couldn't develop this remote in isolation. Here, `App.tsx` receives
  host state as a **prop** (`theme?`) with a sensible local default instead of reaching up into the
  container's federated modules. `src/bootstrap.tsx` is a small standalone harness that renders exactly the
  same `<App />` the container federates, so `npm start` works with zero host dependency.
- **Owns its own nested routes.** `App.tsx` calls `useRoutes` internally instead of the container passing
  down a `view` prop to switch between pages. This is what lets `/stats` exist without the container's
  route table (or its bundle) ever needing to know about it.
- **`src/types/host.d.ts`** documents a *properly typed* contract for the container's `./store`, replacing
  the `any`-typed `declare module 'container/store'` in the original `@types/remote-modules.d.ts`. It's
  intentionally unused by `App.tsx` by default - only reach for it if a deeply nested component genuinely
  needs host state and prop drilling isn't practical.
- **Federation config exported as a function**, not a static object - same reasoning as the container base:
  reading `process.env` at module-evaluation time can race `load-env.js`, and an empty remote/host URL
  produces a cryptic Module Federation crash instead of a clear error. Additionally, the `container` remote
  entry is only added when `URL_HOST_CONTAINER` is actually set, so a standalone build never needs it.
- **ESLint + Prettier**, absent from the original.
- **`publicPath: 'auto'`**, matching the container.

## Verified

`npm install`, `npm run typecheck`, and both dev-mode and `--mode production` rspack builds were run
against this scaffold and pass cleanly, producing a valid `remoteEntry.js` + Module Federation manifest.
