/**
 * Request-scoped Server Supabase client using `@supabase/ssr` and Next.js 15 `cookies()`.
 * Used in Server Components, Server Actions, and Route Handlers to inspect authenticated users
 * safely on the server (`supabase.auth.getUser()`) without trusting client state.
 *
 * Related: src/lib/env.ts, src/lib/supabase/client.ts, src/lib/supabase/admin.ts
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getClientEnv } from '@/lib/env';

/**
 * Creates a cookie-aware Supabase server client bound to the current Next.js request.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const env = getClientEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Calling setAll inside a Server Component is expected to be a no-op;
            // middleware refreshes auth cookies on matching requests.
          }
        },
      },
    },
  );
}
