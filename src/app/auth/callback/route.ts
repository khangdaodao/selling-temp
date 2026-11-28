/**
 * Supabase Auth callback Route Handler (`/auth/callback`).
 * Exchanges PKCE OAuth / confirmation `code` values or verifies email `token_hash`
 * payloads into `HttpOnly` session cookies, synchronizes `public.users` via Prisma,
 * and redirects safely to an internal path (`?next=`).
 *
 * Security boundary: Validates `next` through `resolveSafeNextPath()` to prevent
 * open redirects to external domains.
 *
 * Related: src/lib/supabase/server.ts, src/lib/auth/server-auth.ts, src/lib/auth/auth-utils.ts
 */

import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { resolveSafeNextPath } from '@/lib/auth/auth-utils';
import { getServerAuthSession } from '@/lib/auth/server-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

/**
 * Completes OAuth or email verification callbacks and redirects to the requested app route.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const defaultNext = typeParam === 'recovery' ? '/login?mode=reset' : '/library';
  const nextPath = resolveSafeNextPath(searchParams.get('next'), defaultNext);

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await getServerAuthSession();
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  } else if (tokenHash && typeParam && ALLOWED_OTP_TYPES.has(typeParam as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: typeParam as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) {
      await getServerAuthSession();
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
