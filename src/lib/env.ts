/**
 * Runtime environment variable validation for forma/ Phase 2 (Supabase Hybrid).
 * Separates browser-safe `NEXT_PUBLIC_*` variables from server-only secrets
 * so secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) are never bundled client-side.
 *
 * Security boundary: Never import or call `getServerEnv()` inside `'use client'` modules.
 *
 * Related: .env.example, src/lib/supabase/*, src/lib/prisma.ts
 */

import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL.'),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(20, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set.'),
});

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY must be set on the server.'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set on the server.'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL must be set on the server.'),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates and returns browser-safe public Supabase configuration.
 * Uses direct `process.env.NEXT_PUBLIC_*` property access so Next.js can inline values client-side.
 */
export function getClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

/**
 * Validates and returns server-only Supabase and Prisma PostgreSQL configuration.
 * Throws immediately if invoked in a browser environment or if required secrets are missing.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must never be executed in the browser.');
  }

  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  });
}
