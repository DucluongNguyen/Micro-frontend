# about-remote

A minimal Module Federation remote exposing an "About" page, built from the
same pattern as `portal-relationship/base` (see that project's README for the
full list of best practices this follows: typed federation config, `dts:
false`, stable `output.uniqueName`, standalone-runnable, etc.).

## Quickstart

```bash
npm install
npm start          # http://localhost:3010, runs standalone
```

To see it federated into the container, run `portal-container/base`
(`npm start`, port 3008) and open `http://localhost:3008/about`.

## Federation contract

- Name: `About`
- Exposes: `./App` (`src/App.tsx`)
- Port: 3010

Wired into the container via `URL_HOST_ABOUT` in
`portal-container/base/.env.development` (and the equivalent prod env file).
