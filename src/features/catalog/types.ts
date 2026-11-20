/**
 * Catalog feature types for Library filtering, tabbing, and sorting.
 *
 * Related: src/features/catalog/catalog-utils.ts, src/features/catalog/components/library-view.tsx
 */

import type { FrameworkType, ProductCategory, ProductTier } from '@/types/domain';

/** Top-level tab selection in the Library view. */
export type CatalogTab = 'all' | 'component' | 'template';

/** Supported sorting orders in the Library toolbar. */
export type CatalogSortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

/** Complete filter state driving the Library product grid. */
export interface CatalogFilterState {
  tab: CatalogTab;
  category: ProductCategory | 'all';
  tier: ProductTier | 'all';
  framework: FrameworkType | 'all';
  searchQuery: string;
  sortBy: CatalogSortOption;
}

/** Default unfiltered state for the Library page. */
export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  tab: 'all',
  category: 'all',
  tier: 'all',
  framework: 'all',
  searchQuery: '',
  sortBy: 'newest',
};
