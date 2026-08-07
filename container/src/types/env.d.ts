// Editor/type-only view of the env vars this app reads via process.env.*
// (actually substituted at build time by rspack's DefinePlugin - see
// rspack.config.ts and src/config/env.ts). Keep in sync with envSchema.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'sit' | 'uat' | 'staging';
    readonly HOST_API_URL: string;
  }
}
