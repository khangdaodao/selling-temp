/**
 * Homepage presentation view matching Reference Screen #1.
 * Receives SSR-loaded initial featured products from the App Router Server Component
 * (`src/app/page.tsx`) and synchronizes with `productRepository` on reset events.
 *
 * Related: src/app/page.tsx, src/features/catalog/components/home-hero-showcase.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pickLocalizedText, useI18n } from '@/i18n/use-i18n-store';
import { formatProductPrice } from '@/lib/format/currency';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { productRepository } from '@/services';
import type { Product } from '@/types/domain';
import { HomeHeroShowcase } from './home-hero-showcase';
import { ProductCardVisual } from './product-card-visual';

interface HomepageViewProps {
  /** Initial SSR-provided featured catalog items so first paint renders immediately. */
  initialFeaturedProducts: Product[];
}

/**
 * Full Homepage layout following the Dark Minimalism + Cyan Accent design reference.
 */
export function HomepageView({
  initialFeaturedProducts,
}: HomepageViewProps): React.JSX.Element {
  const { t, locale, currency } = useI18n();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(
    initialFeaturedProducts,
  );

  useEffect(() => {
    let active = true;

    const syncFeatured = async (): Promise<void> => {
      const all = await productRepository.getAll();
      if (active) {
        setFeaturedProducts(all.filter((item) => item.featured).slice(0, 6));
      }
    };

    void syncFeatured();

    const handleReset = (): void => {
      void syncFeatured();
    };
    window.addEventListener(DEMO_RESET_EVENT, handleReset);

    return () => {
      active = false;
      window.removeEventListener(DEMO_RESET_EVENT, handleReset);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="forma-grid-bg">
      {/* 2-Column Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.08]">
              {t.home.headlineLine1}
              <br />
              <span>{t.home.headlineLine2} </span>
              <span className="text-accent-cyan">{t.home.headlineAccent}</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {t.home.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="default" size="lg" asChild>
                <Link href="/library">
                  <span>{t.home.primaryCta}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/library?tab=template">
                  <span>{t.home.secondaryCta}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                {t.home.trustLifetime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                {t.home.trustSupport}
              </span>
            </div>
          </motion.div>

          <div className="lg:col-span-6">
            <HomeHeroShowcase />
          </div>
        </div>
      </section>

      {/* Social Proof / Target Audience Strip */}
      <section className="border-y border-white/[0.08] bg-[#070709]/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            {t.home.audienceLabel}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-10">
            {t.home.audiences.map((audience) => (
              <span
                key={audience}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured 3x2 Showcase Section: "Sản phẩm của chúng tôi" */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t.home.showcaseTitle}
          </h2>
          <Button variant="outline" size="default" asChild>
            <Link href="/library">
              <span>{t.home.showcaseCta}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3 text-xs">
          <span className="font-mono font-medium uppercase tracking-wider text-zinc-400">
            {t.home.showcaseEyebrow}
          </span>
          <span className="text-zinc-500">{t.home.showcaseSubnote}</span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => {
            const priceText = formatProductPrice(
              product.priceVnd,
              product.priceUsd,
              currency,
              t.library.freeLabel,
            );
            return (
              <article
                key={product.id}
                className="forma-surface group flex flex-col justify-between rounded-xl p-4 transition-all hover:border-white/25"
              >
                <Link href={`/products/${product.slug}`} className="block">
                  <ProductCardVisual product={product} />

                  <div className="mt-4 flex items-baseline justify-between gap-3 px-0.5">
                    <h3 className="text-base font-semibold text-white transition-colors group-hover:text-accent-cyan">
                      {product.name}
                    </h3>
                    <span
                      className={`font-mono text-sm font-medium ${
                        product.tier === 'free' ? 'text-accent-cyan' : 'text-zinc-200'
                      }`}
                    >
                      {priceText}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 px-0.5 text-sm text-zinc-400">
                    {pickLocalizedText(product.shortDescription, locale)}
                  </p>
                </Link>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] px-0.5 pt-3 text-xs text-zinc-500">
                  <span className="font-mono">{product.frameworks.join(' · ')}</span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/preview/${product.slug}`}
                      className="text-zinc-400 transition-colors hover:text-accent-cyan"
                    >
                      {t.library.openPreviewLabel}
                    </Link>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1 text-zinc-200 transition-colors hover:text-white"
                    >
                      {t.library.viewDetailsLabel}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      </div>
    </MotionConfig>
  );
}
