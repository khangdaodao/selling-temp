/**
 * Product card component tailored for the forma/ Library grid (Reference Screen #2).
 * Links card title/details to `/products/[slug]` and the preview icon/button to
 * Fullscreen Live Preview (`/preview/[slug]`), while allowing inline interactive demos
 * (`interactive-card`) to be tested directly inside the card.
 *
 * Related: src/app/products/[slug]/page.tsx, src/app/preview/[slug]/page.tsx
 */

'use client';

import Link from 'next/link';
import { ArrowUpRight, Heart, Maximize2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/features/wishlist/use-wishlist-store';
import { pickLocalizedText, useI18n } from '@/i18n/use-i18n-store';
import { formatProductPrice } from '@/lib/format/currency';
import type { Product } from '@/types/domain';
import { ProductCardVisual } from './product-card-visual';

interface CatalogProductCardProps {
  product: Product;
}

/**
 * Interactive or thumbnail catalog card displayed inside the Library 3-column grid.
 */
export function CatalogProductCard({
  product,
}: CatalogProductCardProps): React.JSX.Element {
  const { t, locale, currency } = useI18n();
  const wishlisted = useWishlistStore((state) =>
    state.productIds.includes(product.id),
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const isInteractive = product.previewMode === 'interactive-card';
  const categoryLabel = t.library.sidebar.categories[product.category];
  const formattedPrice = formatProductPrice(
    product.priceVnd,
    product.priceUsd,
    currency,
    t.library.freeLabel,
  );

  return (
    <article className="forma-surface group flex flex-col justify-between rounded-xl p-3.5 transition-colors hover:border-white/20">
      <div>
        {/* Card Header matching Library reference */}
        <div className="mb-3 flex items-start justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {product.type === 'component'
                ? `${t.library.componentLabel} · ${categoryLabel}`
                : `${t.library.templateLabel} · ${categoryLabel}`}
            </p>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-white">
              <Link
                href={`/products/${product.slug}`}
                className="transition-colors hover:text-accent-cyan"
              >
                {product.name}
              </Link>
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              aria-label={
                wishlisted ? t.productDetail.wishlistSaved : t.productDetail.wishlistAdd
              }
              className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                wishlisted
                  ? 'border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan'
                  : 'border-white/10 bg-[#141418] text-zinc-400 hover:border-white/25 hover:text-white'
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </button>

            <Link
              href={`/preview/${product.slug}`}
              title={`${t.library.openPreviewLabel}: ${product.name}`}
              aria-label={`${t.library.openPreviewLabel}: ${product.name}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-[#141418] text-zinc-400 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Visual / Inline Interactive Demo */}
        <ProductCardVisual product={product} compact />

        <Link
          href={`/products/${product.slug}`}
          className="mt-3 block px-0.5 text-xs leading-relaxed text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <span className="line-clamp-2">
            {pickLocalizedText(product.shortDescription, locale)}
          </span>
        </Link>
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] px-0.5 pt-3">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-sm font-semibold ${
              product.tier === 'free' ? 'text-accent-cyan' : 'text-white'
            }`}
          >
            {formattedPrice}
          </span>
          <span className="font-mono text-[10px] text-zinc-500">
            {product.frameworks[0]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isInteractive ? (
            <Badge variant="cyan" className="px-2 py-0.5 text-[10px]">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              <span>{t.library.interactiveBadge}</span>
            </Badge>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 transition-colors hover:text-white"
            >
              <span>{t.library.viewDetailsLabel}</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
