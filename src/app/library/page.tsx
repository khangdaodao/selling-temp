/**
 * App Router Server Component entrypoint for `/library`.
 * Exports route metadata and wraps `LibraryView` inside a React `<Suspense>` boundary
 * required by Next.js when client components read `useSearchParams()`.
 *
 * Related: src/features/catalog/components/library-view.tsx, src/features/catalog/components/library-skeleton.tsx
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LibrarySkeleton } from '@/features/catalog/components/library-skeleton';
import { LibraryView } from '@/features/catalog/components/library-view';

export const metadata: Metadata = {
  title: 'Library — forma/',
  description:
    'Tìm kiếm, lọc và trải nghiệm toàn bộ UI Components và Website Templates của forma/.',
};

/**
 * `/library` Server Component route wrapper.
 */
export default function LibraryPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LibrarySkeleton />}>
      <LibraryView />
    </Suspense>
  );
}
