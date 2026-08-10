declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'sit' | 'uat' | 'staging';
    readonly HOST_API_URL: string;
  }
}
