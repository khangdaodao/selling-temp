/**
 * Privileged server-only Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`.
 * Bypasses Row Level Security (RLS) exclusively for trusted server operations such as
 * generating signed Private Storage URLs or synchronizing server-verified auth records.
 *
 * Security boundary: NEVER import this module into Client Components or expose its key.
 *
 * Related: src/lib/env.ts, src/lib/supabase/server.ts
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';

let adminClient: SupabaseClient | null = null;

/**
 * Returns a singleton server-only Supabase client authenticated with `SUPABASE_SERVICE_ROLE_KEY`.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const env = getServerEnv();
  if (adminClient) {
    return adminClient;
  }

  adminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return adminClient;
}
