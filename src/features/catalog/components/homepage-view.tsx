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
import { useRouter } from 'next/navigation';
import { MotionConfig, motion } from 'motion/react';
import { ArrowUpRight, Check, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useWishlistStore } from '@/features/wishlist/use-wishlist-store';
import { pickLocalizedText, useI18n } from '@/i18n/use-i18n-store';
import { formatProductPrice } from '@/lib/format/currency';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { productRepository } from '@/services';
import type { Product } from '@/types/domain';
import { HomeHeroShowcase } from './home-hero-showcase';
import { Metrics } from './home-metrics-strip';
import { TechStackMarquee } from './home-tech-stack-strip';
import { ProductCardVisual } from './product-card-visual';

interface HomeProductCardProps {
  /** Featured catalog item rendered inside the Homepage "Our Products" 3x2 grid. */
  product: Product;
}

/**
 * Compact Homepage featured product card with smooth hover elevation (`scale-[1.02]`),
 * top-right hover/focus reveal actions (Wishlist + Add to Cart / Claim Free),
 * visual preview frame, localized price, and direct Live Preview trigger.
 */
function HomeProductCard({ product }: HomeProductCardProps): React.JSX.Element {
  const router = useRouter();
  const { t, locale, currency } = useI18n();
  const session = useAuthStore((state) => state.session);
  const ownedProductIds = useAuthStore((state) => state.ownedProductIds);
  const claimFreeProduct = useAuthStore((state) => state.claimFreeProduct);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const wishlisted = useWishlistStore((state) =>
    state.productIds.includes(product.id),
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const isOwned = session !== null && ownedProductIds.includes(product.id);
  const isInCart = cartItems.some((item) => item.productId === product.id);
  const priceText = formatProductPrice(
    product.priceVnd,
    product.priceUsd,
    currency,
    t.library.freeLabel,
  );

  const handleCartOrClaimClick = async (): Promise<void> => {
    if (isOwned) {
      router.push('/account');
      return;
    }

    if (product.tier === 'free') {
      if (!session) {
        router.push(`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`);
        return;
      }
      await claimFreeProduct(product, currency);
      return;
    }

    if (isInCart) {
      openDrawer();
      return;
    }

    addItem(product.id, session ? ownedProductIds : []);
  };

  const cartActionLabel = isOwned
    ? t.cart.ownedBadge
    : product.tier === 'free'
      ? t.productDetail.getFreeCta
      : isInCart
        ? t.cart.inCartBadge
        : t.cart.addToCart;

  return (
    <article className="forma-surface group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:border-white/25 hover:shadow-card motion-reduce:hover:scale-100">
      {/* Top-right Quick Actions: hidden at rest on desktop, revealed smoothly on hover/focus */}
      <div className="absolute right-3.5 top-3.5 z-20 flex items-center gap-1.5 transition-all duration-200 md:pointer-events-none md:translate-y-0.5 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={wishlisted}
          aria-label={
            wishlisted
              ? `${t.productDetail.wishlistSaved}: ${product.name}`
              : `${t.productDetail.wishlistAdd}: ${product.name}`
          }
          title={wishlisted ? t.productDetail.wishlistSaved : t.productDetail.wishlistAdd}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border backdrop-blur-sm transition-colors ${
            wishlisted
              ? 'border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan'
              : 'border-white/10 bg-[#141418]/90 text-zinc-300 hover:border-accent-cyan/50 hover:text-accent-cyan'
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => void handleCartOrClaimClick()}
          aria-label={`${cartActionLabel}: ${product.name}`}
          title={cartActionLabel}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border backdrop-blur-sm transition-colors ${
            isOwned || isInCart
              ? 'border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan'
              : 'border-white/10 bg-[#141418]/90 text-zinc-300 hover:border-accent-cyan/50 hover:text-accent-cyan'
          }`}
        >
          {isOwned ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Top Header (Product Name + Short Description) & Visual Preview */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="px-0.5">
          {/* Reserve top-right space so title never overlaps the hover Heart/Cart buttons */}
          <h3 className="pr-16 text-base font-semibold tracking-tight text-white transition-colors group-hover:text-accent-cyan">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
            {pickLocalizedText(product.shortDescription, locale)}
          </p>
        </div>

        <div className="mt-3.5">
          <ProductCardVisual product={product} />
        </div>
      </Link>

      {/* Bottom Bar: Price (left) + Preview Action Button (right) */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] px-0.5 pt-3">
        <span
          className={`font-mono text-sm font-semibold ${
            product.tier === 'free' ? 'text-accent-cyan' : 'text-white'
          }`}
        >
          {priceText}
        </span>
        <Link
          href={`/preview/${product.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#141418] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan"
        >
          <span>{t.library.openPreviewLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

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
  const { t } = useI18n();
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

      {/* Metrics Strip (Owner Custom Concept replacing Audience Strip) */}
      <Metrics />

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

        <div className="mt-6 flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
          <span className="font-mono font-medium uppercase tracking-wider text-zinc-400">
            {t.home.showcaseEyebrow}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Single-Row Tech Stack Marquee positioned between Our Products and Footer */}
      <TechStackMarquee />
      </div>
    </MotionConfig>
  );
}
