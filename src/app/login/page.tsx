/**
 * App Router Server Component entrypoint for `/login`.
 * Wraps `LoginView` inside React `<Suspense>` so `useSearchParams()` handles `?next=` safely.
 *
 * Related: src/features/auth/components/login-view.tsx
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginView } from '@/features/auth/components/login-view';

export const metadata: Metadata = {
  title: 'Login (Demo) — forma/',
  description: 'Sign in with a demo account on forma/ to claim free releases and run simulated checkout.',
};

/**
 * `/login` Server Component route wrapper.
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-xs text-zinc-500">
          Loading demo login...
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
