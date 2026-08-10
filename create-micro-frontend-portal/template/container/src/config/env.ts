import { z } from 'zod';

/**
 * Single source of truth for runtime configuration.
 *
 * The original portal-container read `process.env.X` inline all over the
 * codebase with no validation, so a missing/misspelled env var only ever
 * surfaced as a confusing runtime error deep inside a component. Validating
 * once, at startup, fails fast with a clear message instead.
 *
 * Values are injected at build time via rspack's DefinePlugin
 * (see rspack.config.ts), which replaces `process.env.HOST_API_URL` etc.
 * with string literals - they are NOT read from a real Node process at
 * runtime in the browser.
 */
const envSchema = z.object({
  HOST_API_URL: z.string().url(),
});

export const env = envSchema.parse({
  HOST_API_URL: process.env.HOST_API_URL,
});

export type Env = z.infer<typeof envSchema>;
