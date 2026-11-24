/**
 * Product card component tailored for the full-bleed forma/ Library grid.
 * Follows the compact two-tier visual structure: dark top header (`Name` + `Category` subtitle +
 * hover/focus Wishlist & Cart quick actions), edge-to-edge full-width preview stage,
 * and compact bottom bar with localized integer price and direct Live Preview trigger.
 *
 * Related: src/app/library/page.tsx, src/app/products/[slug]/page.tsx, src/app/preview/[slug]/page.tsx
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Heart, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useWishlistStore } from '@/features/wishlist/use-wishlist-store';
import { useI18n } from '@/i18n/use-i18n-store';
import { formatProductPrice } from '@/lib/format/currency';
import type { Product } from '@/types/domain';
import { ProductCardVisual } from './product-card-visual';

interface CatalogProductCardProps {
  product: Product;
}

/**
 * Edge-to-edge catalog card displayed inside the Library product workspace.
 */
export function CatalogProductCard({
  product,
}: CatalogProductCardProps): React.JSX.Element {
  const router = useRouter();
  const { t, currency } = useI18n();
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
  const isInteractive = product.previewMode === 'interactive-card';
  const categoryLabel = t.library.sidebar.categories[product.category];
  const formattedPrice = formatProductPrice(
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
    <article className="forma-surface group relative flex flex-col overflow-hidden rounded-xl bg-[#0d0d11] transition-all duration-300 ease-out hover:border-white/25 hover:shadow-card">
      {/* Top Dark Header: Product Title + Category Subtitle + Hover Wishlist/Cart Actions */}
      <div className="relative flex items-start justify-between gap-2 px-4 py-3">
        <Link href={`/products/${product.slug}`} className="min-w-0 flex-1 pr-16">
          <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-accent-cyan">
            {product.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-400">{categoryLabel}</p>
        </Link>

        {/* Quick Actions: revealed on hover/focus on desktop, always accessible on touch */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 transition-all duration-200 md:pointer-events-none md:translate-y-0.5 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
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
      </div>

      {/* Edge-to-Edge Preview Frame (interactive cards stay unlinked so buttons never nest in <a>) */}
      <div className="border-y border-white/[0.06]">
        {isInteractive ? (
          <ProductCardVisual product={product} compact flush />
        ) : (
          <Link
            href={`/products/${product.slug}`}
            aria-label={product.name}
            className="block"
          >
            <ProductCardVisual product={product} compact flush />
          </Link>
        )}
      </div>

      {/* Bottom Compact Footer: Price + Framework on left, Preview trigger on right */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`font-mono text-sm font-semibold ${
              product.tier === 'free' ? 'text-accent-cyan' : 'text-white'
            }`}
          >
            {formattedPrice}
          </span>
          <span className="truncate font-mono text-[10px] text-zinc-500">
            {product.frameworks[0]}
          </span>
        </div>

        <Link
          href={`/preview/${product.slug}`}
          aria-label={`${t.library.openPreviewLabel}: ${product.name}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-[#141418] px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan"
        >
          <span>{t.library.openPreviewLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
