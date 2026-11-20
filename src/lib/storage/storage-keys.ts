/**
 * Centralized localStorage key definitions and schema version for forma/ Phase 1.
 * Keeping all persistence keys in one module guarantees safe cleanup and schema migration.
 *
 * Related: src/lib/storage/storage-adapter.ts
 */

/** Current persistence envelope version. Increment when breaking schema changes occur. */
export const STORAGE_SCHEMA_VERSION = 'v1' as const;

/** Prefix applied to all browser storage keys owned by forma/. */
export const STORAGE_PREFIX = `forma:${STORAGE_SCHEMA_VERSION}:` as const;

/**
 * Exhaustive registry of localStorage keys used across Phase 1 demo features.
 * Note: Never store secrets, passwords, or payment card numbers in any key.
 */
export const STORAGE_KEYS = {
  locale: `${STORAGE_PREFIX}locale`,
  currency: `${STORAGE_PREFIX}currency`,
  products: `${STORAGE_PREFIX}products`,
  cart: `${STORAGE_PREFIX}cart`,
  wishlist: `${STORAGE_PREFIX}wishlist`,
  authSession: `${STORAGE_PREFIX}auth_session`,
  orders: `${STORAGE_PREFIX}orders`,
  coupons: `${STORAGE_PREFIX}coupons`,
  ownedProductIds: `${STORAGE_PREFIX}owned_product_ids`,
} as const;

/** Union of all valid forma/ storage keys. */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Custom browser event dispatched whenever demo data is reset to seed defaults. */
export const DEMO_RESET_EVENT = 'forma:demo-data-reset' as const;
