/**
 * App Router Server Component entrypoint for the Homepage (`/`).
 * Queries featured published products directly from PostgreSQL via Prisma for SEO/SSR HTML,
 * then hands off interactive language/currency switching to `HomepageView`.
 *
 * Related: src/features/catalog/components/homepage-view.tsx, src/lib/catalog/product-mapper.ts
 */

import type { Metadata } from 'next';
import { HomepageView } from '@/features/catalog/components/homepage-view';
import { getPublishedFeaturedProductsFromDb } from '@/lib/catalog/product-mapper';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Forma/ — UI Components & Website Templates',
  description:
    'Kho UI Components và Website Templates tối giản cho Next.js & React theo chiến lược Demo-first.',
};

/**
 * Root `/` Server Component passing initial featured PostgreSQL catalog items to the client view.
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  const initialFeaturedProducts = await getPublishedFeaturedProductsFromDb(6);

  return <HomepageView initialFeaturedProducts={initialFeaturedProducts} />;
}
