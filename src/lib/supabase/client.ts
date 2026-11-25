/**
 * Browser-side Supabase client factory using `@supabase/ssr`.
 * Uses only public `NEXT_PUBLIC_*` keys and relies on Row Level Security (RLS)
 * + `HttpOnly` auth cookies managed by Next.js middleware and server routes.
 *
 * Related: src/lib/env.ts, src/lib/supabase/server.ts
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getClientEnv } from '@/lib/env';

let browserClient: SupabaseClient | null = null;

/**
 * Returns a memoized browser Supabase client configured with the public publishable key.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }
  const env = getClientEnv();
  browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  return browserClient;
}
