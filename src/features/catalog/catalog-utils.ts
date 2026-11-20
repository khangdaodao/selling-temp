/**
 * Pure filtering, search, sorting, and category counting functions for the forma/ catalog.
 * Extracted from UI components so business logic stays deterministic and testable.
 *
 * Related: src/features/catalog/types.ts, src/types/domain.ts
 */

import type { CurrencyCode, Product, ProductCategory } from '@/types/domain';
import type { CatalogFilterState, CatalogTab } from './types';

/** Ordered list of catalog categories shown in the Library sidebar. */
export const ORDERED_CATEGORIES: readonly ProductCategory[] = [
  'hero',
  'navbar',
  'pricing',
  'cards',
  'footer',
  'saas',
  'dashboard',
  'portfolio',
  'ecommerce',
];

function getComparablePrice(product: Product, currency: CurrencyCode): number {
  return currency === 'VND' ? product.priceVnd : product.priceUsd;
}

/**
 * Checks whether any non-default filter or search query is active.
 *
 * @param filters - Current catalog filter state.
 * @returns `true` if at least one filter or search term narrows the list.
 */
export function hasActiveCatalogFilters(filters: CatalogFilterState): boolean {
  return (
    filters.tab !== 'all' ||
    filters.category !== 'all' ||
    filters.tier !== 'all' ||
    filters.framework !== 'all' ||
    filters.searchQuery.trim().length > 0 ||
    filters.sortBy !== 'newest'
  );
}

/**
 * Filters and sorts catalog products according to tab, category, tier, framework,
 * bilingual search text, and active currency sort order.
 *
 * @param products - Full list of published products from `productRepository`.
 * @param filters - Active filter & sort selections.
 * @param currency - Active display currency (`'VND'` or `'USD'`) used for price sorting.
 * @returns Filtered and newly sorted array without mutating the input array.
 */
export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilterState,
  currency: CurrencyCode,
): Product[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (filters.tab !== 'all' && product.type !== filters.tab) {
      return false;
    }
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    if (filters.tier !== 'all' && product.tier !== filters.tier) {
      return false;
    }
    if (filters.framework !== 'all' && !product.frameworks.includes(filters.framework)) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const haystack = [
        product.name,
        product.slug,
        product.category,
        product.thumbnailSubtitle,
        product.shortDescription.vi,
        product.shortDescription.en,
        ...product.tags,
        ...product.frameworks,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc': {
        const diff = getComparablePrice(a, currency) - getComparablePrice(b, currency);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case 'price-desc': {
        const diff = getComparablePrice(b, currency) - getComparablePrice(a, currency);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
  });
}

/**
 * Counts published products grouped by top-level tab (`all`, `component`, `template`).
 */
export function countProductsByType(products: Product[]): {
  all: number;
  component: number;
  template: number;
} {
  let component = 0;
  let template = 0;
  for (const item of products) {
    if (item.type === 'component') {
      component += 1;
    } else {
      template += 1;
    }
  }
  return {
    all: products.length,
    component,
    template,
  };
}

/**
 * Counts products per category scoped by the currently selected top-level tab.
 */
export function countProductsByCategory(
  products: Product[],
  activeTab: CatalogTab,
): Record<ProductCategory | 'all', number> {
  const counts: Record<ProductCategory | 'all', number> = {
    all: 0,
    hero: 0,
    navbar: 0,
    pricing: 0,
    cards: 0,
    footer: 0,
    dashboard: 0,
    saas: 0,
    portfolio: 0,
    ecommerce: 0,
  };

  for (const item of products) {
    if (activeTab !== 'all' && item.type !== activeTab) {
      continue;
    }
    counts.all += 1;
    counts[item.category] += 1;
  }

  return counts;
}
