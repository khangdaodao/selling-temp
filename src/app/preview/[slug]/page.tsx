/**
 * App Router Server Component entrypoint for `/preview/[slug]`.
 * Resolves published product metadata directly from PostgreSQL and passes it to `FullscreenPreviewView`.
 *
 * Related: src/features/preview/components/fullscreen-preview-view.tsx, src/lib/catalog/product-mapper.ts
 */

import type { Metadata } from 'next';
import { FullscreenPreviewView } from '@/features/preview/components/fullscreen-preview-view';
import { getPublishedProductBySlugFromDb } from '@/lib/catalog/product-mapper';

export const dynamic = 'force-dynamic';

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
  const product = await getPublishedProductBySlugFromDb(slug);
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
  const initialProduct = await getPublishedProductBySlugFromDb(slug);

  return <FullscreenPreviewView slug={slug} initialProduct={initialProduct} />;
}
