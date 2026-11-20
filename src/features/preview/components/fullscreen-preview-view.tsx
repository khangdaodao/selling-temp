/**
 * Fullscreen Live Preview workspace (`/preview/[slug]`).
 * Provides viewport presets (`Desktop` / `Tablet 768px` / `Mobile 375px`),
 * preview-only `Dark` / `Light` toggle (when supported by the product),
 * Refresh state reset button, View Details navigation, and Purchase CTA.
 *
 * Related: src/app/preview/[slug]/page.tsx, src/features/preview/registry/preview-registry.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Monitor,
  Moon,
  RefreshCw,
  Smartphone,
  Sun,
  Tablet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';
import { formatProductPrice } from '@/lib/format/currency';
import { productRepository } from '@/services';
import type { Product } from '@/types/domain';
import { PreviewCanvas, resolvePreviewKind } from '../registry/preview-registry';
import type { PreviewTheme, PreviewViewport } from '../types';

interface FullscreenPreviewViewProps {
  slug: string;
  initialProduct: Product | null;
}

/**
 * Interactive fullscreen preview chrome wrapping `PreviewCanvas` across responsive presets.
 */
export function FullscreenPreviewView({
  slug,
  initialProduct,
}: FullscreenPreviewViewProps): React.JSX.Element {
  const { t, currency } = useI18n();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [viewport, setViewport] = useState<PreviewViewport>('desktop');
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>(() =>
    initialProduct?.thumbnailVariant === 'light' && initialProduct.supportsThemeToggle
      ? 'light'
      : 'dark',
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const syncProduct = async (): Promise<void> => {
      const latest = await productRepository.getBySlug(slug);
      if (active && latest) {
        setProduct(latest);
      }
    };
    void syncProduct();
    return () => {
      active = false;
    };
  }, [slug]);

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold text-white">{t.preview.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.preview.notFoundBody}</p>
        <Button variant="default" size="sm" className="mt-6" asChild>
          <Link href="/library">{t.preview.backToLibrary}</Link>
        </Button>
      </div>
    );
  }

  const previewKind = resolvePreviewKind(product.previewComponentKey);
  const modeLabel =
    previewKind === 'static-iframe'
      ? t.preview.modeStaticIframe
      : previewKind === 'react-component'
        ? t.preview.modeReactRegistry
        : t.preview.modeMockFallback;

  const formattedPrice = formatProductPrice(
    product.priceVnd,
    product.priceUsd,
    currency,
    t.library.freeLabel,
  );

  const handleRefresh = (): void => {
    setRefreshKey((prev) => prev + 1);
    setNotice(t.preview.refreshedNotice);
    window.setTimeout(() => setNotice(null), 1800);
  };

  const handleBuyPlaceholder = (): void => {
    setNotice(t.productDetail.checkoutDeferredNotice);
    window.setTimeout(() => setNotice(null), 2800);
  };

  const viewportWidthClass =
    viewport === 'mobile'
      ? 'max-w-[375px]'
      : viewport === 'tablet'
        ? 'max-w-[768px]'
        : 'max-w-full';

  return (
    <div className="min-h-[85vh] bg-[#040406]">
      {/* Sticky Fullscreen Preview Controls Bar */}
      <div className="sticky top-16 z-30 border-b border-white/[0.08] bg-[#08080b]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Left: Back & Product Identity */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.preview.backToDetails}</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">{product.name}</h1>
              <Badge variant="cyan" className="hidden text-[10px] sm:inline-flex">
                {modeLabel}
              </Badge>
            </div>
          </div>

          {/* Center: Responsive Viewport Presets */}
          <div
            role="group"
            aria-label={t.preview.viewportLabel}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#101015] p-1"
          >
            {(
              [
                { id: 'desktop', label: t.preview.viewportDesktop, Icon: Monitor },
                { id: 'tablet', label: t.preview.viewportTablet, Icon: Tablet },
                { id: 'mobile', label: t.preview.viewportMobile, Icon: Smartphone },
              ] as const
            ).map(({ id, label, Icon }) => {
              const active = viewport === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewport(id)}
                  aria-pressed={active}
                  title={label}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Theme Toggle, Refresh, View Details & CTA */}
          <div className="flex flex-wrap items-center gap-2">
            {product.supportsThemeToggle ? (
              <div className="inline-flex rounded-lg border border-white/10 bg-[#101015] p-1">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('dark')}
                  aria-pressed={previewTheme === 'dark'}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                    previewTheme === 'dark'
                      ? 'bg-white/15 font-semibold text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Moon className="h-3 w-3" aria-hidden="true" />
                  <span>{t.preview.themeDark}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('light')}
                  aria-pressed={previewTheme === 'light'}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                    previewTheme === 'light'
                      ? 'bg-white font-semibold text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sun className="h-3 w-3" aria-hidden="true" />
                  <span>{t.preview.themeLight}</span>
                </button>
              </div>
            ) : (
              <span className="hidden rounded-md border border-white/10 bg-surface px-2.5 py-1 text-[11px] text-zinc-500 sm:inline-block">
                {t.preview.themeFixedDark}
              </span>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              aria-label={t.preview.refreshDemo}
              title={t.preview.refreshDemo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-surface text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href={`/products/${product.slug}`}>{t.preview.viewDetails}</Link>
            </Button>

            <Button variant="cyan" size="sm" onClick={handleBuyPlaceholder}>
              <span>
                {product.tier === 'free'
                  ? t.productDetail.getFreeCta
                  : `${formattedPrice}`}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {notice ? (
          <div
            role="status"
            className="border-t border-accent-cyan/20 bg-accent-cyan/10 px-4 py-1.5 text-center text-xs text-accent-cyan"
          >
            {notice}
          </div>
        ) : null}
      </div>

      {/* Centered Responsive Stage */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div
          className={`mx-auto w-full transition-all duration-300 ${viewportWidthClass}`}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#09090d] shadow-card">
            {/* Minimal Device Chrome Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0e0e13] px-4 py-2 text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </div>
              <span className="font-mono">
                forma.preview/{product.slug} • {viewport}
              </span>
              <span className="font-mono text-accent-cyan">{previewTheme}</span>
            </div>

            <div className="p-3 sm:p-5">
              <PreviewCanvas
                product={product}
                theme={previewTheme}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
