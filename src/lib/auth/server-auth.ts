/**
 * Server-only authentication, PostgreSQL user synchronization, and RBAC guards for forma/.
 * Verifies Supabase Auth sessions via `supabase.auth.getUser()` (never `getSession()` or
 * client-provided claims) and reads authoritative authorization roles from `public.users`
 * via Prisma ORM (`ADR-008`).
 *
 * Security boundary:
 * - Never trust `user_metadata` for `role` or authorization checks.
 * - Never import or invoke this module from Client Components.
 *
 * Related: src/lib/supabase/server.ts, src/lib/prisma.ts, prisma/schema.prisma
 */

import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthSession, AuthUser } from '@/types/domain';
import { computeAvatarInitials, normalizeAuthEmail } from './auth-utils';

/**
 * Typed HTTP authorization error thrown by `requireAuthenticatedUser` / `requireAdminUser`.
 */
export class AuthError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

function resolveDisplayName(supabaseUser: SupabaseAuthUser, email: string): string {
  const metadata = supabaseUser.user_metadata as Record<string, unknown> | undefined;
  const rawFullName =
    typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : typeof metadata?.name === 'string'
        ? metadata.name
        : '';

  const trimmed = rawFullName.trim();
  if (trimmed) {
    return trimmed.slice(0, 80);
  }
  const emailPrefix = email.split('@')[0]?.trim();
  return emailPrefix || 'Member';
}

function resolveAuthProvider(supabaseUser: SupabaseAuthUser): AuthSession['authProvider'] {
  const provider = supabaseUser.app_metadata?.provider;
  if (provider === 'google') {
    return 'google';
  }
  return 'email';
}

function mapPrismaUserToAuthUser(record: {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  avatarInitials: string;
  createdAt: Date;
}): AuthUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
    avatarInitials: record.avatarInitials,
    createdAt: record.createdAt.toISOString(),
  };
}

/**
 * Synchronizes an authenticated Supabase Auth user into PostgreSQL `public.users`.
 * Newly created accounts are ALWAYS assigned `role: 'customer'` by default; existing
 * accounts preserve their database-stored `role` (`customer` or `admin`).
 *
 * Self-heals orphan email rows when an account is deleted in Supabase `auth.users`
 * and recreated with the same email under a new UUID, transferring any orders or
 * entitlements atomically while preserving `role`.
 */
export async function syncAuthUserToPrisma(
  supabaseUser: SupabaseAuthUser,
): Promise<AuthUser> {
  if (typeof window !== 'undefined') {
    throw new Error('syncAuthUserToPrisma() must only run on the server.');
  }

  const rawEmail = supabaseUser.email;
  if (!rawEmail) {
    throw new AuthError('Authenticated account is missing an email address.', 401);
  }

  const email = normalizeAuthEmail(rawEmail);
  const existingById = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  if (existingById) {
    if (existingById.email !== email) {
      const updated = await prisma.user.update({
        where: { id: existingById.id },
        data: { email },
      });
      return mapPrismaUserToAuthUser(updated);
    }
    return mapPrismaUserToAuthUser(existingById);
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    include: {
      _count: {
        select: { orders: true, entitlements: true },
      },
    },
  });

  if (existingByEmail) {
    const preservedRole = existingByEmail.role;
    const defaultName =
      existingByEmail.name || resolveDisplayName(supabaseUser, email);
    const avatarInitials =
      existingByEmail.avatarInitials ||
      computeAvatarInitials(defaultName, email);

    const relinked = await prisma.$transaction(async (tx) => {
      if (
        existingByEmail._count.orders === 0 &&
        existingByEmail._count.entitlements === 0
      ) {
        await tx.user.delete({ where: { id: existingByEmail.id } });
        return tx.user.create({
          data: {
            id: supabaseUser.id,
            email,
            name: defaultName,
            role: preservedRole,
            avatarInitials,
          },
        });
      }

      await tx.user.update({
        where: { id: existingByEmail.id },
        data: { email: `${existingByEmail.id}.archived.${email}` },
      });
      const replacement = await tx.user.create({
        data: {
          id: supabaseUser.id,
          email,
          name: defaultName,
          role: preservedRole,
          avatarInitials,
        },
      });
      await tx.order.updateMany({
        where: { userId: existingByEmail.id },
        data: { userId: supabaseUser.id },
      });
      await tx.userEntitlement.updateMany({
        where: { userId: existingByEmail.id },
        data: { userId: supabaseUser.id },
      });
      await tx.user.delete({ where: { id: existingByEmail.id } });
      return replacement;
    });

    return mapPrismaUserToAuthUser(relinked);
  }

  const defaultName = resolveDisplayName(supabaseUser, email);
  const avatarInitials = computeAvatarInitials(defaultName, email);

  const created = await prisma.user.create({
    data: {
      id: supabaseUser.id,
      email,
      name: defaultName,
      role: 'customer',
      avatarInitials,
    },
  });

  return mapPrismaUserToAuthUser(created);
}

/**
 * Returns the server-verified `AuthSession` for the current HTTP request, or `null`
 * when unauthenticated or when token verification with Supabase Auth fails.
 */
export async function getServerAuthSession(): Promise<AuthSession | null> {
  if (typeof window !== 'undefined') {
    throw new Error('getServerAuthSession() must only run on the server.');
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const dbUser = await syncAuthUserToPrisma(user);

  return {
    user: dbUser,
    authProvider: resolveAuthProvider(user),
    signedInAt: user.last_sign_in_at ?? user.created_at ?? new Date().toISOString(),
  };
}

/**
 * Enforces an authenticated user on the server and returns the database-backed `AuthUser`.
 * Throws `AuthError(401)` if no valid session exists.
 */
export async function requireAuthenticatedUser(): Promise<AuthUser> {
  const session = await getServerAuthSession();
  if (!session) {
    throw new AuthError('Authentication required.', 401);
  }
  return session.user;
}

/**
 * Enforces Server RBAC for Admin routes and mutations by checking `role === 'admin'`
 * directly against PostgreSQL `public.users`.
 * Throws `AuthError(401)` if signed out or `AuthError(403)` if signed in as customer.
 */
export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== 'admin') {
    throw new AuthError('Administrator role required.', 403);
  }
  return user;
}
