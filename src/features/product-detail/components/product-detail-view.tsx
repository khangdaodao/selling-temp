/**
 * Product Detail presentation view (`/products/[slug]`).
 * Displays full product metadata, live inline preview for `interactive-card` items,
 * thumbnail stage with Fullscreen Live Preview launcher, Wishlist persistence via `StorageAdapter`,
 * Overview / Documentation tabs, and UI-simulated Locked Source Code tab with explicit security notes.
 *
 * Security boundary: Locking Source Code for unowned accounts in Phase 1 is strictly a UX
 * demonstration on the client and NOT real server authorization.
 *
 * Related: src/app/products/[slug]/page.tsx, src/features/preview/registry/preview-registry.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  FileCode2,
  Heart,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductCardVisual } from '@/features/catalog/components/product-card-visual';
import { PreviewCanvas } from '@/features/preview/registry/preview-registry';
import { useWishlistStore } from '@/features/wishlist/use-wishlist-store';
import { pickLocalizedText, useI18n } from '@/i18n/use-i18n-store';
import { formatProductPrice } from '@/lib/format/currency';
import { orderRepository, productRepository } from '@/services';
import type { Product } from '@/types/domain';

interface ProductDetailViewProps {
  slug: string;
  initialProduct: Product | null;
}

type DetailTab = 'overview' | 'documentation' | 'source';

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Full Product Detail page view combining metadata, preview stage, wishlist, and tabs.
 */
export function ProductDetailView({
  slug,
  initialProduct,
}: ProductDetailViewProps): React.JSX.Element {
  const { t, locale, currency } = useI18n();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const wishlisted = useWishlistStore((state) =>
    product ? state.productIds.includes(product.id) : false,
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  useEffect(() => {
    let active = true;

    const syncData = async (): Promise<void> => {
      const [latestProduct, owned] = await Promise.all([
        productRepository.getBySlug(slug),
        orderRepository.getOwnedProductIds(),
      ]);
      if (active) {
        if (latestProduct) {
          setProduct(latestProduct);
        }
        setOwnedIds(owned);
      }
    };

    void syncData();
    return () => {
      active = false;
    };
  }, [slug]);

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold text-white">{t.productDetail.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.productDetail.notFoundBody}</p>
        <Button variant="default" size="sm" className="mt-6" asChild>
          <Link href="/library">{t.productDetail.backToLibrary}</Link>
        </Button>
      </div>
    );
  }

  const isOwned = ownedIds.includes(product.id);
  const isInlineInteractive =
    product.previewMode === 'interactive-card' && product.previewComponentKey !== null;
  const formattedPrice = formatProductPrice(
    product.priceVnd,
    product.priceUsd,
    currency,
    t.library.freeLabel,
  );
  const categoryLabel = t.library.sidebar.categories[product.category];

  const handleDeferredCheckout = (): void => {
    setActionNotice(t.productDetail.checkoutDeferredNotice);
    window.setTimeout(() => setActionNotice(null), 3200);
  };

  return (
    <div className="min-h-[80vh] bg-canvas pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-zinc-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.productDetail.backToLibrary}</span>
            </Link>
            <span>/</span>
            <span>{categoryLabel}</span>
            <span>/</span>
            <span className="font-medium text-white">{product.name}</span>
          </div>
        </div>

        {/* Main 12-Column Detail Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left 7 Columns: Live Stage or Thumbnail + Quick Specs */}
          <div className="space-y-6 lg:col-span-7">
            <div className="forma-surface overflow-hidden rounded-2xl p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-400">
                  {product.previewComponentKey === null
                    ? t.productDetail.fallbackPreviewHint
                    : isInlineInteractive
                      ? t.productDetail.liveInteractiveHint
                      : t.productDetail.thumbnailPreviewHint}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/preview/${product.slug}`}>
                    <span>{t.productDetail.openFullscreenPreview}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              {isInlineInteractive ? (
                <PreviewCanvas product={product} theme="dark" refreshKey={0} />
              ) : (
                <div className="relative">
                  <ProductCardVisual product={product} />
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0b0b0f] px-4 py-3">
                    <span className="font-mono text-xs text-zinc-400">
                      {product.previewMode}
                    </span>
                    <Button variant="cyan" size="sm" asChild>
                      <Link href={`/preview/${product.slug}`}>
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.productDetail.openFullscreenPreview}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Spec Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="forma-surface rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.productDetail.specs.framework}
                </p>
                <p className="mt-1 font-mono text-xs font-semibold text-white">
                  {product.frameworks.join(' · ')}
                </p>
              </div>
              <div className="forma-surface rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.productDetail.specs.category}
                </p>
                <p className="mt-1 text-xs font-semibold text-white">{categoryLabel}</p>
              </div>
              <div className="forma-surface rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.productDetail.specs.themeSupport}
                </p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {product.supportsThemeToggle
                    ? t.productDetail.specs.themeBoth
                    : t.productDetail.specs.themeDarkOnly}
                </p>
              </div>
              <div className="forma-surface rounded-xl p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.productDetail.specs.latestZip}
                </p>
                <p className="mt-1 truncate font-mono text-xs font-semibold text-white">
                  {formatBytes(product.zipMetadata.sizeBytes)}
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Summary & Action Card */}
          <div className="lg:col-span-5">
            <div className="forma-surface sticky top-24 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={product.tier === 'free' ? 'cyan' : 'muted'}>
                    {product.type === 'component'
                      ? t.library.componentLabel
                      : t.library.templateLabel}
                  </Badge>
                  <Badge variant="outline">{categoryLabel}</Badge>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-pressed={wishlisted}
                  aria-label={
                    wishlisted ? t.productDetail.wishlistSaved : t.productDetail.wishlistAdd
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    wishlisted
                      ? 'border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan'
                      : 'border-white/10 bg-[#141418] text-zinc-300 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`}
                    aria-hidden="true"
                  />
                  <span>
                    {wishlisted ? t.productDetail.wishlistSaved : t.productDetail.wishlistAdd}
                  </span>
                </button>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white">
                {product.name}
              </h1>

              <p
                className={`mt-2 font-mono text-2xl font-bold ${
                  product.tier === 'free' ? 'text-accent-cyan' : 'text-white'
                }`}
              >
                {formattedPrice}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {pickLocalizedText(product.shortDescription, locale)}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="cyan" size="lg" asChild>
                  <Link href={`/preview/${product.slug}`}>
                    <span>{t.productDetail.openFullscreenPreview}</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  onClick={handleDeferredCheckout}
                >
                  <span>
                    {product.tier === 'free'
                      ? t.productDetail.getFreeCta
                      : t.productDetail.buyNowCta}
                  </span>
                </Button>
              </div>

              {actionNotice ? (
                <div
                  role="status"
                  className="mt-4 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 p-3 text-xs leading-relaxed text-accent-cyan"
                >
                  {actionNotice}
                </div>
              ) : null}

              <div className="mt-6 space-y-2.5 border-t border-white/[0.08] pt-5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                  <span>{t.productDetail.specs.lifetimeValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                  <span className="font-mono">{product.zipMetadata.fileName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3 Tabs: Overview / Documentation / Source Code */}
        <div className="mt-12">
          <div
            role="tablist"
            aria-label="Product details tabs"
            className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3"
          >
            {(
              [
                { id: 'overview', label: t.productDetail.tabs.overview },
                { id: 'documentation', label: t.productDetail.tabs.documentation },
                { id: 'source', label: t.productDetail.tabs.sourceCode },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.id === 'source' ? (
                    isOwned ? (
                      <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    )
                  ) : null}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="forma-surface mt-6 rounded-2xl p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                <p className="max-w-3xl text-sm leading-relaxed text-zinc-300">
                  {pickLocalizedText(product.description, locale)}
                </p>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t.productDetail.overviewTagsHeading}
                  </h2>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="font-mono text-[11px]">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t.productDetail.overviewFilesHeading}
                  </h2>
                  <ul className="mt-2.5 space-y-1.5 font-mono text-xs text-zinc-300">
                    {product.codeBundle.map((file) => (
                      <li key={file.path} className="flex items-center gap-2">
                        <FileCode2 className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                        <span>{file.path}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {activeTab === 'documentation' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {t.productDetail.docsInstallHeading}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
                    {pickLocalizedText(product.documentation, locale)}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t.productDetail.docsNotesHeading}
                  </h3>
                  <pre className="mt-2.5 overflow-x-auto rounded-xl border border-white/10 bg-[#08080a] p-4 font-mono text-xs text-zinc-300">
                    {`// 1. Copy bundle files into your Next.js App Router project\n//    ${product.codeBundle.map((f) => f.path).join(', ')}\n// 2. Import design tokens from src/app/globals.css\n// 3. Supports frameworks: ${product.frameworks.join(', ')}`}
                  </pre>
                </div>
              </div>
            ) : null}

            {activeTab === 'source' ? (
              <div className="space-y-5">
                {!isOwned ? (
                  <>
                    <div className="flex flex-col items-start gap-4 rounded-xl border border-white/10 bg-[#08080b] p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#141418] text-white">
                          <Lock className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <Badge variant="cyan" className="mb-2 text-[10px]">
                            {t.productDetail.lockedCode.badge}
                          </Badge>
                          <h2 className="text-base font-semibold text-white">
                            {t.productDetail.lockedCode.title}
                          </h2>
                          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-400">
                            {t.productDetail.lockedCode.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Explicit Phase 1 Non-Security Boundary Disclosure */}
                    <div className="flex items-start gap-3 rounded-xl border border-accent-cyan/25 bg-accent-cyan/5 p-4 text-xs">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-white">
                          {t.productDetail.lockedCode.disclaimerTitle}
                        </p>
                        <p className="mt-1 leading-relaxed text-zinc-300">
                          {t.productDetail.lockedCode.disclaimerBody}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        {t.productDetail.lockedCode.filesHeading}
                      </p>
                      <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {product.codeBundle.map((file) => (
                          <li
                            key={file.path}
                            className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0a0a0d] px-3 py-2 font-mono text-xs text-zinc-400"
                          >
                            <span className="truncate">{file.path}</span>
                            <Lock className="h-3 w-3 shrink-0 text-zinc-500" aria-hidden="true" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-accent-cyan">
                    Owned in My Library — full Monaco Viewer unlocks in Phase 1.5.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
