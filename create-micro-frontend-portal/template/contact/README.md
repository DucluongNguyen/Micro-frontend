# contact-remote

A minimal Module Federation remote exposing a "Contact" page, built from the
same pattern as `portal-relationship/base` (see that project's README for the
full list of best practices this follows: typed federation config, `dts:
false`, stable `output.uniqueName`, standalone-runnable, etc.).

## Quickstart

```bash
npm install
npm start          # http://localhost:3011, runs standalone
```

To see it federated into the container, run `portal-container/base`
(`npm start`, port 3008) and open `http://localhost:3008/contact`.

## Federation contract

- Name: `Contact`
- Exposes: `./App` (`src/App.tsx`)
- Port: 3011

Wired into the container via `URL_HOST_CONTACT` in
`portal-container/base/.env.development` (and the equivalent prod env file).
