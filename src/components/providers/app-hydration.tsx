/**
 * Client-side hydration coordinator for forma/ global Zustand stores.
 * Defers reading browser language and localStorage until after mount so
 * Next.js server-rendered HTML matches the initial client render without hydration warnings.
 *
 * Related: src/i18n/use-i18n-store.ts, src/features/auth/use-auth-store.ts, src/features/cart/use-cart-store.ts
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useWishlistStore } from '@/features/wishlist/use-wishlist-store';
import { useI18nStore } from '@/i18n/use-i18n-store';

/**
 * Mount-only side-effect component placed once in the root layout.
 */
export function AppHydration(): null {
  const hydrateFromEnvironment = useI18nStore((state) => state.hydrateFromEnvironment);
  const hydrateWishlist = useWishlistStore((state) => state.hydrateWishlist);
  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateFromEnvironment();
    hydrateWishlist();
    hydrateCart();
    void hydrateAuth();
  }, [hydrateFromEnvironment, hydrateWishlist, hydrateCart, hydrateAuth]);

  return null;
}
