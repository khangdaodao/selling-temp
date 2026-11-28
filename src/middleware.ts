/**
 * Next.js Edge Middleware for Supabase SSR session cookie refreshing and initial
 * route protection on `/admin`.
 *
 * Security boundary: Edge Middleware refreshes `HttpOnly` auth cookies and redirects
 * unauthenticated `/admin` traffic to `/login?next=/admin`. Authoritative Admin role
 * verification (`role === 'admin'`) is enforced in Node.js Server Components and API
 * routes via `requireAdminUser()` against PostgreSQL `public.users`.
 *
 * Related: src/lib/supabase/server.ts, src/lib/auth/server-auth.ts
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getClientEnv } from '@/lib/env';

/**
 * Refreshes Supabase SSR auth cookies on matching requests and guards `/admin` from guests.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const env = getClientEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search, searchParams } = request.nextUrl;

  if (pathname === '/' && searchParams.has('code')) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/auth/callback';
    return NextResponse.redirect(callbackUrl);
  }

  if (!user && pathname.startsWith('/admin')) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static Next.js internals, public demo bundles,
     * and common static asset extensions.
     */
    '/((?!_next/static|_next/image|favicon.ico|demo-assets/|demo-previews/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|zip)$).*)',
  ],
};
