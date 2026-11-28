/**
 * Admin-only Customers API (`GET /api/admin/customers`) backed by PostgreSQL `public.users`.
 * Strictly enforces Server RBAC via `requireAdminUser()` (`role === 'admin'`), returning
 * `401` for guests and `403` for non-admin accounts.
 *
 * Related: src/lib/auth/server-auth.ts, src/features/admin/components/admin-view.tsx
 */

import { NextResponse } from 'next/server';
import { AuthError, requireAdminUser } from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';

/**
 * Lists registered store users from PostgreSQL for verified Admin accounts only.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdminUser();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarInitials: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        users: users.map((entry) => ({
          ...entry,
          createdAt: entry.createdAt.toISOString(),
        })),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[GET /api/admin/customers] Failed to query registered users.', error);
    return NextResponse.json(
      { error: 'Unable to load customer directory.' },
      { status: 500 },
    );
  }
}
