/**
 * Zustand store managing customer wishlist product IDs persisted via StorageAdapter.
 * Never reads or writes `window.localStorage` directly inside React components.
 *
 * TODO(Phase 2): Synchronize wishlist items with MySQL user wishlist table on the server.
 *
 * Related: src/lib/storage/storage-adapter.ts, src/features/product-detail/components/product-detail-view.tsx
 */

'use client';

import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { DEMO_RESET_EVENT, STORAGE_KEYS } from '@/lib/storage/storage-keys';

interface WishlistState {
  productIds: string[];
  hydrated: boolean;
  hydrateWishlist: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Global Zustand store tracking saved product IDs in Phase 1 localStorage.
 */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  hydrated: false,

  hydrateWishlist: () => {
    if (get().hydrated) {
      return;
    }
    const stored = readStorage<string[]>(STORAGE_KEYS.wishlist, [], isStringArray);
    set({ productIds: stored, hydrated: true });
  },

  toggleWishlist: (productId) => {
    const current = get().productIds;
    const exists = current.includes(productId);
    const next = exists
      ? current.filter((id) => id !== productId)
      : [productId, ...current];
    writeStorage(STORAGE_KEYS.wishlist, next);
    set({ productIds: next, hydrated: true });
  },

  isWishlisted: (productId) => get().productIds.includes(productId),
}));

if (typeof window !== 'undefined') {
  window.addEventListener(DEMO_RESET_EVENT, () => {
    useWishlistStore.setState({ productIds: [], hydrated: true });
  });
}
