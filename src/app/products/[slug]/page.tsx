/**
 * App Router Server Component entrypoint for `/products/[slug]`.
 * Queries the published PostgreSQL product record on the server for SEO metadata
 * and immediate SSR hydration into `ProductDetailView` (with source contents stripped).
 *
 * Related: src/features/product-detail/components/product-detail-view.tsx, src/lib/catalog/product-mapper.ts
 */

import type { Metadata } from 'next';
import { ProductDetailView } from '@/features/product-detail/components/product-detail-view';
import { getPublishedProductBySlugFromDb } from '@/lib/catalog/product-mapper';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generates dynamic SEO metadata per product slug from PostgreSQL.
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlugFromDb(slug);
  return {
    title: product ? `${product.name} — forma/` : 'Product Not Found — forma/',
    description:
      product?.shortDescription.vi ??
      'Chi tiết UI Component / Website Template trên forma/.',
  };
}

/**
 * `/products/[slug]` Server Component route wrapper.
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const initialProduct = await getPublishedProductBySlugFromDb(slug);

  return <ProductDetailView slug={slug} initialProduct={initialProduct} />;
}
