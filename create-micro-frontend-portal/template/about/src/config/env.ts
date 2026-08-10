import { z } from 'zod';

const envSchema = z.object({
  HOST_API_URL: z.string().url(),
});

export const env = envSchema.parse({
  HOST_API_URL: process.env.HOST_API_URL,
});

export type Env = z.infer<typeof envSchema>;
