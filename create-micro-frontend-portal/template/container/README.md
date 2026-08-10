# container-base

A minimal, best-practice base for the **container (host)** side of a Module
Federation micro-frontend architecture, in TypeScript. Built by studying the
existing `portal-container` app and fixing the issues that had crept into it
- see "What's different from portal-container" below.

This is a skeleton, not a full app: it wires up Module Federation, routing,
a shared Redux store, error/loading handling for remotes, typed env
validation, linting and Docker packaging. It exposes `./store` and consumes
three example remotes - `Dashboard` (see `portal-relationship/base`),
`About` (see `../about`) and `Contact` (see `../contact`). Add your own
routes, remotes and store slices on top of it.

## Quickstart

```bash
npm install
npm start          # http://localhost:3008
```

`npm start` alone renders the container with its local `/` route. Visit
`/dashboard`, `/about`, `/contact` to render the federated remotes - for those
you also need the remotes running:

| Remote | Folder | Port |
| --- | --- | --- |
| `Dashboard` | `portal-relationship/base` | 3009 |
| `About` | `../about` | 3010 |
| `Contact` | `../contact` | 3011 |

A remote whose env var (`URL_HOST_DASHBOARD` / `URL_HOST_ABOUT` /
`URL_HOST_CONTACT` in `.env.development`) isn't set is skipped from the
Module Federation config with a console warning, instead of crashing with a
cryptic error. If `src/router/routes.tsx` still statically imports that
remote, the build then fails with a clear `Module not found: Can't resolve
'X/App'` error - to actually run the container against a subset of remotes,
delete the corresponding route(s) too, not just the env var.

### Adding another remote

1. Scaffold a new remote (copy `portal-relationship/base` as a starting point).
2. Add one entry to `REMOTE_DEFINITIONS` in `module-federation.config.ts`.
3. Add the matching `URL_HOST_<NAME>` var to `.env.development` / `.env.production`.
4. Add a `declare module '<Name>/App'` and `declare module '<Name>/navigation'`
   block to `src/types/remotes.d.ts` (see below).
5. Add a route in `src/router/routes.tsx`, mounted at `/<name>/*` (see below).
6. Add a `{ key: '<Name>', mountPath: '/<name>', label: '<Name>', importNavigation: () => import('<Name>/navigation') }`
   entry to `REMOTES` in `src/hooks/useRemoteNavigation.ts` so it shows up in
   the sidebar (see below).

## Layout

`src/layouts/AppLayout.tsx` is an antd `Layout` with a dark Sidebar and a
Header (account menu + logout - see Authentication below), wrapping every
route via react-router's `<Outlet />`. It's the layout element for the
authenticated route tree in `routes.tsx`; `Home` and each remote render as
its children.

The Sidebar itself is built dynamically, not hardcoded - see below.

## Sidebar navigation (collapsible nested routes)

Each remote exposes a small `./navigation` module (plain data, not a
component) alongside `./App`:

```ts
// e.g. portal-relationship/base/src/navigation.ts
export interface RemoteNavItem {
  path: string; // relative to the remote's mount point; '' = index route
  label: string;
  icon?: string; // name of an @ant-design/icons component, see AppLayout.tsx's ICONS map
}

export const navigation: RemoteNavItem[] = [
  { path: '', label: 'Overview', icon: 'AppstoreOutlined' },
  { path: 'stats', label: 'Stats', icon: 'BarChartOutlined' },
];
```

The container's `src/hooks/useRemoteNavigation.ts` dynamically `import()`s
`./navigation` from every remote listed in its `REMOTES` array, resolves each
item's `path` against that remote's mount path (e.g. `stats` under
`Dashboard` becomes `/dashboard/stats`), and hands the result to
`AppLayout.tsx`. `AppLayout` renders each remote as a collapsible antd
SubMenu - collapsed by default (arrow pointing right), expanding in place
(arrow rotates down) to reveal its nested routes on click. This is antd
Menu's built-in SubMenu behavior; no custom expand/collapse logic lives here.
Each item's `icon` string is resolved to a real `@ant-design/icons` component
via a name -> component lookup in `AppLayout.tsx`, so a remote's
`./navigation` module stays plain serializable data with no antd/React import.

Each remote's fetch is isolated: if one remote is down or not yet built, its
section renders as "`<Name> (unavailable)`" instead of breaking the rest of
the sidebar or crashing the container - `useRemoteNavigation` catches
per-remote and never lets one failed `import()` reject the others. This
mirrors the "no hardcoded remote internals" principle used for the routes
themselves: the container only ever hardcodes a remote's *mount path*, never
its page structure.

## Authentication

The entire authenticated area - `AppLayout`, `Home`, and every federated
remote - is gated behind a login screen. Nothing under it renders, and no
remote is ever loaded, without a session:

- `src/store/slices/authSlice.ts` - RTK slice holding `{ token, user }`, with
  a `login` thunk and a `logout` action. Persists the session to
  `localStorage` (key `container.auth`) so a page refresh doesn't drop it;
  the slice reads that storage synchronously at module load so the very
  first render already knows whether there's a session. **The `login` thunk
  is a skeleton mock** (accepts any non-empty username/password after a fake
  delay) - swap its body for a real API call (e.g. via `axios`, already a
  dependency) and nothing else needs to change.
- `src/components/RequireAuth.tsx` - a route guard (`<Outlet />` if
  authenticated, `<Navigate to="/login" />` otherwise) wrapped around the
  `AppLayout` route tree in `src/router/routes.tsx`. `/login` is the only
  route registered outside it. Because remotes only ever get lazy-imported
  and rendered *inside* that guarded tree, they're unreachable pre-login too
  - a direct visit to `/dashboard/stats` redirects to `/login` before the
  `Dashboard` remote is ever fetched.
- The redirect preserves the originally requested path in navigation state,
  so `src/pages/Login.tsx` sends the user back to where they meant to go
  (instead of always landing on `/`) after a successful login.
- `AppLayout`'s Header has an account menu (current username + "Log out",
  which dispatches `logout` and navigates to `/login`).

This mirrors the same "container owns the boundary" principle as routing and
navigation: remotes never see auth state directly (see `src/types/host.d.ts`
on the remote side - they don't import from the container's `./store`), the
container simply never renders them without a session.

## Nested routes inside a remote

Each remote is mounted at `/<name>/*`, not `/<name>` - the trailing `/*` is
what hands off everything past that point to the remote's own routing
instead of the container needing to know a remote's internal page
structure. A remote owns its nested routes entirely: see
`portal-relationship/base/src/App.tsx` for the pattern (a plain `useRoutes`
call with relative paths, which resolves correctly whether the remote is
federated at `/dashboard/*` or run standalone at `/` - no in-remote nav UI:
the container's sidebar is the only navigation, built from `./navigation`
above). `About` and `Contact` follow the same pattern. Add a page to a
remote's own routing
without ever touching the container's route table - just remember to add the
new path to that remote's `src/navigation.ts` too if it should show in the
sidebar (see below).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Dev server with HMR, port 3008 |
| `npm run build` / `build:sit` / `build:uat` / `build:staging` / `build:prod` | Production builds per environment (reads `.env.<NODE_ENV>` via dotenv-flow) |
| `npm run typecheck` | `tsc --noEmit` - wire this into CI |
| `npm run lint` / `lint:fix` | ESLint (flat config, typescript-eslint) |
| `npm run format` | Prettier |

## Project layout

```
module-federation.config.ts   Federation contract (name/exposes/remotes/shared), isolated from build config
rspack.config.ts              Build config; imports the above
src/
  index.ts                    Async entry boundary (required by Module Federation)
  bootstrap.tsx                Mounts the React tree
  App.tsx                      Root component: ConfigProvider + routes
  router/routes.tsx             Route table; lazy-loads each remote at `/<name>/*`
  components/
    layout/AppLayout.tsx         Sidebar + Header shell (antd Layout); routed content renders via <Outlet />
    ErrorBoundary.tsx           Real render-time error boundary
    RemoteBoundary.tsx           Suspense + ErrorBoundary wrapper for federated remotes
  store/
    store.tsx                    Redux Toolkit store, exposed via Module Federation as `./store`
    hooks.ts                     Typed useAppDispatch / useAppSelector
    slices/themeSlice.ts
  config/env.ts                 Zod-validated runtime config
  types/
    env.d.ts                     process.env typings
    remotes.d.ts                 Typed ambient declaration for the `Dashboard` remote
```

## What's different from `portal-container`

- **Full TypeScript.** `App.jsx`, `bootstrap.js`, `router/Router.js`, `redux/store.js` etc. are all
  `.ts`/`.tsx` here, with `strict: true` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, etc.
- **One Module Federation plugin, consistently.** The original container used
  `@module-federation/enhanced`, but `portal-relationship`'s config used the plain
  `rspack.container.ModuleFederationPlugin`. Mixing the two is a real source of runtime-only bugs
  (the enhanced runtime injects extra bootstrap code the plain plugin doesn't). Both apps here use
  `@module-federation/enhanced` consistently.
- **Federation config extracted** into `module-federation.config.ts` and exported as a *function*
  (`createModuleFederationConfig()`), not a static object. A static object reads `process.env` at
  module-evaluation time, and depending on how the `.ts` config loader orders `import`s, that can run
  *before* `load-env.js` populates `process.env` - producing an empty remote URL and a cryptic
  `"object null is not iterable"` crash deep inside rspack. This is a bug I actually hit and fixed
  while building this base; see the comments in that file.
- **Fixed shared-dependency version bugs.** `react-router-dom`'s `requiredVersion` must be `^6.x` on
  *both* sides - the original `portal-relationship/rspack.config.ts` declared `^18.0.0` for it (copied
  from the react/react-dom entries), which silently breaks singleton sharing.
- **Real error boundaries.** The original `lazySafe`/`LoadingMicroFe` helper only caught *import*
  failures. A remote that loads fine but throws while rendering - a common symptom of a shared-dependency
  version mismatch - crashed the whole container. `RemoteBoundary` combines `Suspense` with a real
  `ErrorBoundary`.
- **Typed remote contracts.** `src/types/remotes.d.ts` types the `Dashboard/App` module's actual props
  instead of the `any`-typed ambient declarations `portal-relationship/@types/remote-modules.d.ts` used.
  For a larger federation, prefer `@module-federation/enhanced`'s `dts` type-generation feature over
  hand-written contracts so they can't drift.
- **Validated env config.** `src/config/env.ts` parses `process.env` once with `zod` at startup instead
  of reading `process.env.X` inline all over the codebase with no validation.
- **ESLint + Prettier.** Neither existing folder had ESLint configured at all.
- **`publicPath: 'auto'`** instead of a hardcoded `/`, so the same build works whether served from the
  domain root or behind a path prefix.
- Trimmed the remotes list to three small documented examples (`Dashboard`, `About`, `Contact`)
  instead of ~20 hardcoded business remotes, and built the remotes map from a declarative
  `REMOTE_DEFINITIONS` list that skips (with a warning) any remote whose env var isn't set, rather
  than requiring every single one to be configured just to run the container locally.

## Verified

`npm install`, `npm run typecheck`, `npm start`-equivalent dev build, and a `--mode production` build
were all run against this scaffold and pass cleanly (one unrelated "asset size limit" advisory warning
on the production build, typical for an antd-based bundle without route-level code splitting tuned yet).
