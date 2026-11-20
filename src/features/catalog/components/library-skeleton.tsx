/**
 * Loading skeleton placeholder matching the Library 3-column grid geometry.
 * Used both as the Suspense boundary fallback in `src/app/library/page.tsx`
 * and during initial asynchronous repository reads inside `LibraryView`.
 *
 * Related: src/app/library/page.tsx, src/features/catalog/components/library-view.tsx
 */

import React from 'react';

/**
 * Animated dark minimalist skeleton grid for the Library catalog.
 */
export function LibrarySkeleton(): React.JSX.Element {
  return (
    <div
      aria-busy="true"
      aria-label="Loading library catalog"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
    >
      <div className="mb-8 h-12 animate-pulse rounded-xl border border-white/[0.08] bg-surface" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="hidden space-y-4 lg:col-span-3 lg:block">
          <div className="h-64 animate-pulse rounded-xl border border-white/[0.08] bg-surface" />
          <div className="h-40 animate-pulse rounded-xl border border-white/[0.08] bg-surface" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-72 animate-pulse flex-col justify-between rounded-xl border border-white/[0.08] bg-surface p-4"
            >
              <div className="h-4 w-28 rounded bg-white/10" />
              <div className="h-40 w-full rounded-lg bg-white/[0.05]" />
              <div className="h-4 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
