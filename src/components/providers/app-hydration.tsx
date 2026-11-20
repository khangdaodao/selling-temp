/**
 * Client-side hydration coordinator for forma/ global Zustand stores.
 * Defers reading browser language and localStorage until after mount so
 * Next.js server-rendered HTML matches the initial client render without hydration warnings.
 *
 * Related: src/i18n/use-i18n-store.ts, src/app/layout.tsx
 */

'use client';

import { useEffect } from 'react';
import { useI18nStore } from '@/i18n/use-i18n-store';

/**
 * Mount-only side-effect component placed once in the root layout.
 */
export function AppHydration(): null {
  const hydrateFromEnvironment = useI18nStore((state) => state.hydrateFromEnvironment);

  useEffect(() => {
    hydrateFromEnvironment();
  }, [hydrateFromEnvironment]);

  return null;
}
