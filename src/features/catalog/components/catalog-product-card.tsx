/**
 * Product card component tailored for the forma/ Library grid (Reference Screen #2).
 * Displays product header + placeholder preview button, miniature visual or interactive card demo,
 * integer dual-currency price, and framework metadata.
 *
 * Related: src/features/catalog/components/product-card-visual.tsx, src/lib/format/currency.ts
 */

'use client';

import { useState } from 'react';
import { Maximize2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const [showPlaceholderHint, setShowPlaceholderHint] = useState(false);

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
              {product.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowPlaceholderHint((prev) => !prev)}
            aria-expanded={showPlaceholderHint}
            title={t.library.previewPlaceholderHint}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#141418] text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Visual / Inline Interactive Placeholder */}
        <ProductCardVisual product={product} compact />

        {showPlaceholderHint ? (
          <div className="mt-2.5 rounded-md border border-accent-cyan/25 bg-accent-cyan/5 px-2.5 py-1.5 text-[11px] leading-snug text-accent-cyan">
            {t.library.previewPlaceholderHint}
          </div>
        ) : (
          <p className="mt-3 line-clamp-2 px-0.5 text-xs leading-relaxed text-zinc-400">
            {pickLocalizedText(product.shortDescription, locale)}
          </p>
        )}
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

        {isInteractive ? (
          <Badge variant="cyan" className="px-2 py-0.5 text-[10px]">
            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
            <span>{t.library.interactiveBadge}</span>
          </Badge>
        ) : (
          <span className="text-[11px] text-zinc-500">
            {product.previewComponentKey === null
              ? t.library.fallbackBadge
              : product.previewMode === 'template-fullscreen'
                ? 'Template'
                : 'Thumbnail'}
          </span>
        )}
      </div>
    </article>
  );
}
