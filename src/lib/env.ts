import { z } from 'zod';

const publicAppEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://wealix.app'),
});

const publicClerkEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
});

let cachedPublicAppEnv: z.infer<typeof publicAppEnvSchema> | null = null;
let cachedPublicClerkEnv: z.infer<typeof publicClerkEnvSchema> | null = null;

export function getPublicAppEnv() {
  if (cachedPublicAppEnv) {
    return cachedPublicAppEnv;
  }

  cachedPublicAppEnv = publicAppEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app',
  });

  return cachedPublicAppEnv;
}

export function getPublicClerkEnv() {
  if (cachedPublicClerkEnv) {
    return cachedPublicClerkEnv;
  }

  cachedPublicClerkEnv = publicClerkEnvSchema.parse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  return cachedPublicClerkEnv;
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is required but was not provided.`);
  }
  return value;
}
