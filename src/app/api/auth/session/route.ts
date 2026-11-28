/**
 * Server-verified Auth Session API (`/api/auth/session`).
 * - `GET`: Validates Supabase session via `getUser()` and returns the synced `public.users` record.
 * - `PATCH`: Updates the authenticated user's display name (`name`, `avatarInitials`) in Postgres.
 *
 * Security boundary: Never accepts `role` or `userId` from request payloads.
 *
 * Related: src/lib/auth/server-auth.ts, src/features/auth/use-auth-store.ts
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { computeAvatarInitials } from '@/lib/auth/auth-utils';
import {
  AuthError,
  getServerAuthSession,
  requireAuthenticatedUser,
} from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Display name is required.')
    .max(80, 'Display name must be 80 characters or fewer.'),
});

/**
 * Returns the verified server session or `{ session: null }` when unauthenticated.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerAuthSession();
    return NextResponse.json(
      { session },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    console.error('[GET /api/auth/session] Failed to resolve auth session.', error);
    return NextResponse.json(
      { error: 'Unable to verify authentication session.' },
      { status: 500 },
    );
  }
}

/**
 * Updates the current signed-in user's display profile inside PostgreSQL `public.users`.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const user = await requireAuthenticatedUser();
    const rawBody: unknown = await request.json();
    const parsed = updateProfileSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? 'Invalid profile update payload.',
        },
        { status: 400 },
      );
    }

    const cleanName = parsed.data.name;
    const avatarInitials = computeAvatarInitials(cleanName, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: cleanName,
        avatarInitials,
      },
    });

    const supabase = await createSupabaseServerClient();
    await supabase.auth.updateUser({
      data: { full_name: cleanName },
    });

    const refreshedSession = await getServerAuthSession();
    return NextResponse.json({ session: refreshedSession }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[PATCH /api/auth/session] Failed to update user profile.', error);
    return NextResponse.json(
      { error: 'Unable to update profile.' },
      { status: 500 },
    );
  }
}
