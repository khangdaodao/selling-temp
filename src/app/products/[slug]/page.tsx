/**
 * App Router Server Component entrypoint for `/products/[slug]`.
 * Pre-loads the matching product from seed data on the server for SEO metadata
 * and immediate hydration into `ProductDetailView`.
 *
 * Related: src/features/product-detail/components/product-detail-view.tsx, src/mocks/products.seed.ts
 */

import type { Metadata } from 'next';
import { ProductDetailView } from '@/features/product-detail/components/product-detail-view';
import { SEED_PRODUCTS } from '@/mocks/products.seed';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generates dynamic SEO metadata per product slug.
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((item) => item.slug === slug);
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
  const initialProduct =
    SEED_PRODUCTS.find((item) => item.slug === slug) ?? null;

  return <ProductDetailView slug={slug} initialProduct={initialProduct} />;
}
