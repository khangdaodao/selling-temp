/**
 * Loading skeleton placeholder matching the full-bleed Library workspace geometry.
 * Used both as the Suspense boundary fallback in `src/app/library/page.tsx`
 * and during initial asynchronous repository reads inside `LibraryView`.
 *
 * Related: src/app/library/page.tsx, src/features/catalog/components/library-view.tsx
 */

import React from 'react';

/**
 * Animated dark minimalist skeleton matching the full-bleed Library sidebar and grid.
 */
export function LibrarySkeleton(): React.JSX.Element {
  return (
    <div
      aria-busy="true"
      aria-label="Loading library catalog"
      className="min-h-[calc(100vh-65px)] w-full bg-canvas lg:flex lg:h-[calc(100vh-65px)] lg:flex-col lg:overflow-hidden"
    >
      <div className="h-12 w-full shrink-0 animate-pulse border-b border-white/[0.08] bg-[#070709]" />
      <div className="flex w-full flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
        <div className="hidden h-full w-[250px] shrink-0 space-y-4 border-r border-white/[0.08] p-4 lg:block xl:w-[268px]">
          <div className="h-64 animate-pulse rounded-xl border border-white/[0.08] bg-surface" />
          <div className="h-36 animate-pulse rounded-xl border border-white/[0.08] bg-surface" />
        </div>
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-7">
          <div className="mb-6 h-9 w-full animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-72 animate-pulse flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] bg-surface"
              >
                <div className="h-12 bg-white/[0.03]" />
                <div className="h-44 bg-white/[0.05]" />
                <div className="h-10 bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
