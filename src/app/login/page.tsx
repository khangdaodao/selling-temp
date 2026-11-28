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
  title: 'Sign In — forma/',
  description: 'Sign in or create an account on forma/ with Supabase Auth.',
};

/**
 * `/login` Server Component route wrapper.
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-xs text-zinc-500">
          Loading sign-in form...
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
