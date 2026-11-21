/**
 * Zustand store managing the slide-over Cart Drawer state, product deduplication,
 * and StorageAdapter-backed persistence across browser refreshes.
 *
 * Security boundary: Cart state and applied coupon code in localStorage are for Phase 1
 * demo UX only. Phase 2 servers MUST recompute authoritative line-item prices and eligibility
 * from MySQL before creating a real payment intent.
 *
 * TODO(Phase 2): Synchronize cart with server session and ignore client-submitted prices.
 *
 * Related: src/features/cart/components/cart-drawer.tsx, src/lib/storage/storage-adapter.ts
 */

'use client';

import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { DEMO_RESET_EVENT, STORAGE_KEYS } from '@/lib/storage/storage-keys';
import type { CartItem } from '@/types/domain';

/** Outcome returned when attempting to add a product to the cart. */
export type AddToCartResult = 'added' | 'already_in_cart' | 'already_owned';

interface StoredCartPayload {
  items: CartItem[];
  couponCode: string | null;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  drawerOpen: boolean;
  hydrated: boolean;
  hydrateCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (productId: string, ownedIds: string[]) => AddToCartResult;
  removeItem: (productId: string) => void;
  pruneOwnedItems: (ownedIds: string[]) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
}

function isCartItemArray(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartItem).productId === 'string' &&
        typeof (item as CartItem).addedAt === 'string',
    )
  );
}

function isStoredCartPayload(value: unknown): value is StoredCartPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as StoredCartPayload;
  return (
    isCartItemArray(candidate.items) &&
    (candidate.couponCode === null || typeof candidate.couponCode === 'string')
  );
}

function persistCart(items: CartItem[], couponCode: string | null): void {
  writeStorage<StoredCartPayload>(STORAGE_KEYS.cart, { items, couponCode });
}

/**
 * Global Zustand store for shopping cart items with automatic deduplication and persistence.
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: null,
  drawerOpen: false,
  hydrated: false,

  hydrateCart: () => {
    if (get().hydrated) {
      return;
    }
    const stored = readStorage<StoredCartPayload>(
      STORAGE_KEYS.cart,
      { items: [], couponCode: null },
      isStoredCartPayload,
    );
    set({
      items: stored.items,
      couponCode: stored.couponCode,
      hydrated: true,
    });
  },

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

  addItem: (productId, ownedIds) => {
    if (ownedIds.includes(productId)) {
      return 'already_owned';
    }

    const { items, couponCode } = get();
    if (items.some((item) => item.productId === productId)) {
      set({ drawerOpen: true });
      return 'already_in_cart';
    }

    const nextItems: CartItem[] = [
      { productId, addedAt: new Date().toISOString() },
      ...items,
    ];
    persistCart(nextItems, couponCode);
    set({ items: nextItems, drawerOpen: true, hydrated: true });
    return 'added';
  },

  removeItem: (productId) => {
    const { items, couponCode } = get();
    const nextItems = items.filter((item) => item.productId !== productId);
    persistCart(nextItems, couponCode);
    set({ items: nextItems });
  },

  pruneOwnedItems: (ownedIds) => {
    if (ownedIds.length === 0) {
      return;
    }
    const { items, couponCode } = get();
    const nextItems = items.filter((item) => !ownedIds.includes(item.productId));
    if (nextItems.length !== items.length) {
      persistCart(nextItems, couponCode);
      set({ items: nextItems });
    }
  },

  setCouponCode: (couponCode) => {
    persistCart(get().items, couponCode);
    set({ couponCode });
  },

  clearCart: () => {
    persistCart([], null);
    set({ items: [], couponCode: null });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener(DEMO_RESET_EVENT, () => {
    useCartStore.setState({
      items: [],
      couponCode: null,
      drawerOpen: false,
      hydrated: true,
    });
  });
}
