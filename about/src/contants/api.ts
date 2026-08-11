import { env } from '@/config/env';

/**
 * Centralized API endpoint paths, built from `env.HOST_API_URL` (see
 * config/env.ts) instead of each call site hardcoding its own full URL -
 * every endpoint here automatically follows whichever host the current
 * environment (.env.development/.env.production/...) points to.
 */
export const API_URL = {
  POSTS: `${env.HOST_API_URL}/posts`,
};
