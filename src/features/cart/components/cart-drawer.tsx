/**
 * Right-side slide-over Cart Drawer for forma/ Phase 1.
 * Resolves cart item IDs via `productRepository`, enforces duplicate-free line items,
 * displays integer VND/USD subtotals, and routes users to One-Page Checkout (`/checkout`).
 *
 * Related: src/features/cart/use-cart-store.ts, src/app/checkout/page.tsx
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShoppingBag, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useI18n } from '@/i18n/use-i18n-store';
import { formatMoneyAmount } from '@/lib/format/currency';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { productRepository } from '@/services';
import type { Product } from '@/types/domain';

/**
 * Slide-over shopping cart drawer mounted globally inside RootLayout.
 */
export function CartDrawer(): React.JSX.Element | null {
  const { t, currency } = useI18n();
  const items = useCartStore((state) => state.items);
  const drawerOpen = useCartStore((state) => state.drawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const removeItem = useCartStore((state) => state.removeItem);
  const pruneOwnedItems = useCartStore((state) => state.pruneOwnedItems);
  const session = useAuthStore((state) => state.session);
  const ownedProductIds = useAuthStore((state) => state.ownedProductIds);

  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    const loadCatalog = async (): Promise<void> => {
      const list = await productRepository.getAll();
      if (active) {
        setCatalog(list);
      }
    };
    void loadCatalog();

    const handleReset = (): void => {
      void loadCatalog();
    };
    window.addEventListener(DEMO_RESET_EVENT, handleReset);
    return () => {
      active = false;
      window.removeEventListener(DEMO_RESET_EVENT, handleReset);
    };
  }, []);

  useEffect(() => {
    if (session) {
      pruneOwnedItems(ownedProductIds);
    }
  }, [session, ownedProductIds, pruneOwnedItems]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, closeDrawer]);

  const cartProducts = useMemo(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    return items
      .map((item) => byId.get(item.productId))
      .filter((product): product is Product => product !== undefined);
  }, [catalog, items]);

  const subtotalVnd = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.priceVnd, 0),
    [cartProducts],
  );
  const subtotalUsd = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.priceUsd, 0),
    [cartProducts],
  );

  if (!drawerOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t.cart.title}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart backdrop"
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Slide-over Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#09090c] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
            <h2 className="text-base font-semibold text-white">{t.cart.title}</h2>
            <Badge variant="cyan" className="text-[10px]">
              {cartProducts.length}
            </Badge>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart drawer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-surface text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {cartProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-surface text-zinc-400">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-white">
                {t.cart.emptyTitle}
              </h3>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                {t.cart.emptyBody}
              </p>
              <Button variant="outline" size="sm" className="mt-5" asChild>
                <Link href="/library" onClick={closeDrawer}>
                  {t.cart.emptyBrowseCta}
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartProducts.map((product) => {
                const amount = currency === 'VND' ? product.priceVnd : product.priceUsd;
                return (
                  <li
                    key={product.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.08] bg-surface p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        {product.type} · {t.library.sidebar.categories[product.category]}
                      </p>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeDrawer}
                        className="mt-0.5 block truncate text-sm font-semibold text-white hover:text-accent-cyan"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-zinc-300">
                        {formatMoneyAmount(amount, currency)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      aria-label={`${t.cart.removeItem}: ${product.name}`}
                      title={t.cart.removeItem}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#121216] text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartProducts.length > 0 ? (
          <div className="border-t border-white/[0.08] bg-[#07070a] px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">{t.cart.subtotalLabel}</span>
              <span className="font-mono text-lg font-bold text-white">
                {formatMoneyAmount(
                  currency === 'VND' ? subtotalVnd : subtotalUsd,
                  currency,
                )}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button variant="default" size="lg" asChild>
                <Link href="/checkout" onClick={closeDrawer}>
                  <span>{t.cart.proceedCheckout}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={closeDrawer}>
                {t.cart.continueBrowsing}
              </Button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
