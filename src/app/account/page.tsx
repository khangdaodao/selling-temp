/**
 * App Router Server Component entrypoint for `/account`.
 * Renders `AccountView` inside `<Suspense>` for the Customer Minimal Account Dashboard.
 *
 * Related: src/features/account/components/account-view.tsx
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AccountView } from '@/features/account/components/account-view';

export const metadata: Metadata = {
  title: 'Account (Demo) — forma/',
  description:
    'Customer Account Workspace: My Library, Order History, Wishlist, Profile Settings, and Read-Only Monaco Viewer.',
};

/**
 * `/account` Server Component route wrapper.
 */
export default function AccountPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-xs text-zinc-500">
          Loading account workspace...
        </div>
      }
    >
      <AccountView />
    </Suspense>
  );
}
