/**
 * App Router Server Component entrypoint for `/preview/[slug]`.
 * Resolves initial seed metadata and passes the product snapshot to `FullscreenPreviewView`.
 *
 * Related: src/features/preview/components/fullscreen-preview-view.tsx, src/mocks/products.seed.ts
 */

import type { Metadata } from 'next';
import { FullscreenPreviewView } from '@/features/preview/components/fullscreen-preview-view';
import { SEED_PRODUCTS } from '@/mocks/products.seed';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generates dynamic page metadata for each product live preview route.
 */
export async function generateMetadata({
  params,
}: PreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((item) => item.slug === slug);
  return {
    title: product ? `Preview: ${product.name} — forma/` : 'Preview — forma/',
    description: product?.shortDescription.vi ?? 'Live interactive preview on forma/.',
  };
}

/**
 * `/preview/[slug]` Server Component route wrapper.
 */
export default async function PreviewPage({
  params,
}: PreviewPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const initialProduct =
    SEED_PRODUCTS.find((item) => item.slug === slug) ?? null;

  return <FullscreenPreviewView slug={slug} initialProduct={initialProduct} />;
}
