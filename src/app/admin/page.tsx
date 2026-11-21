/**
 * Admin Dashboard route (`/admin`) entrypoint for forma/ Phase 1.
 * Thin App Router wrapper delegating UI rendering to the client-side `AdminView` workspace.
 *
 * Security boundary: Phase 1 gating relies on browser demo role state ONLY.
 * TODO(Phase 2): Enforce server-side session RBAC before rendering or mutating `/admin`.
 *
 * Related: src/features/admin/components/admin-view.tsx
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminView } from '@/features/admin/components/admin-view';

export const metadata: Metadata = {
  title: 'Admin Dashboard (Demo)',
  description:
    'Mock personal storefront administration for managing components, templates, Draft/Published status, coupons, and demo orders.',
};

/**
 * `/admin` Server Component page shell.
 */
export default function AdminPage(): React.JSX.Element {
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
