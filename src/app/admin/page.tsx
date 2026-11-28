/**
 * Admin Dashboard route (`/admin`) entrypoint protected by Server RBAC (`Phase 2.2`).
 * Verifies Supabase Auth session and PostgreSQL `public.users.role === 'admin'` on the
 * server BEFORE sending any Admin UI bundle or rendering `<AdminView />`.
 *
 * Security boundary:
 * - Unauthenticated visitors redirect immediately to `/login?next=/admin`.
 * - Signed-in non-admin accounts receive `<AdminForbiddenView />` (403) without Admin UI HTML.
 *
 * Related: src/lib/auth/server-auth.ts, src/features/admin/components/admin-view.tsx
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminForbiddenView } from '@/features/admin/components/admin-forbidden-view';
import { AdminView } from '@/features/admin/components/admin-view';
import { getServerAuthSession } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard — forma/',
  description:
    'Personal storefront administration for managing components, templates, Draft/Published status, coupons, and orders.',
};

/**
 * `/admin` Server Component entrypoint enforcing server-side RBAC.
 */
export default async function AdminPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/login?next=/admin');
  }

  if (session.user.role !== 'admin') {
    return <AdminForbiddenView user={session.user} />;
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#0b0b0f]" />
        </div>
      }
    >
      <AdminView />
    </Suspense>
  );
}
