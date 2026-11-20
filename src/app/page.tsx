/**
 * App Router Server Component entrypoint for the Homepage (`/`).
 * Pre-renders the 6 featured seed products on the server for instant SEO/SSR HTML,
 * then hands off interactive language/currency switching and repository syncing to `HomepageView`.
 *
 * Related: src/features/catalog/components/homepage-view.tsx, src/mocks/products.seed.ts
 */

import type { Metadata } from 'next';
import { HomepageView } from '@/features/catalog/components/homepage-view';
import { SEED_PRODUCTS } from '@/mocks/products.seed';

export const metadata: Metadata = {
  title: 'forma/ — UI Components & Website Templates',
  description:
    'Kho UI Components và Website Templates tối giản cho Next.js & React theo chiến lược Demo-first.',
};

/**
 * Root `/` Server Component passing initial featured catalog items to the client view.
 */
export default function HomePage(): React.JSX.Element {
  const initialFeaturedProducts = SEED_PRODUCTS.filter(
    (product) => product.status === 'published' && product.featured,
  ).slice(0, 6);

  return <HomepageView initialFeaturedProducts={initialFeaturedProducts} />;
}
