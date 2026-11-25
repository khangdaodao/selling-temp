/**
 * Full-bleed interactive Library catalog client component inspired by crisp SaaS library layouts.
 * Features an edge-to-edge sub-header (`Components` | `Templates` tabs + centered `⌘K` search),
 * an independent fixed scrollable left Sidebar anchored to the left edge with pill counts
 * (`Categories`, `Pricing`), a compact single-row grid header with `Sort`,
 * and an edge-to-edge card grid (`CatalogProductCard`).
 *
 * Related: src/app/library/page.tsx, src/features/catalog/catalog-utils.ts, src/services/index.ts
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { productRepository } from '@/services';
import type {
  Product,
  ProductCategory,
  ProductTier,
} from '@/types/domain';
import {
  ORDERED_CATEGORIES,
  countProductsByCategory,
  countProductsByTier,
  countProductsByType,
  filterAndSortProducts,
  hasActiveCatalogFilters,
} from '../catalog-utils';
import {
  DEFAULT_CATALOG_FILTERS,
  type CatalogFilterState,
  type CatalogSortOption,
  type CatalogTab,
} from '../types';
import { CatalogProductCard } from './catalog-product-card';

function parseTabParam(raw: string | null): CatalogTab {
  return raw === 'template' ? 'template' : 'component';
}

function parseTierParam(raw: string | null): ProductTier | 'all' {
  if (raw === 'free' || raw === 'paid') {
    return raw;
  }
  return 'all';
}

function parseCategoryParam(raw: string | null): ProductCategory | 'all' {
  if (raw && (ORDERED_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as ProductCategory;
  }
  return 'all';
}

/**
 * Full-bleed Library workspace with edge-hugging sub-header, scrollable left sidebar,
 * single-row sort header, and responsive product grid.
 */
export function LibraryView(): React.JSX.Element {
  const { t, currency } = useI18n();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<CatalogFilterState>(() => ({
    ...DEFAULT_CATALOG_FILTERS,
    tab: parseTabParam(searchParams.get('tab')),
    tier: parseTierParam(searchParams.get('tier')),
    category: parseCategoryParam(searchParams.get('category')),
    searchQuery: searchParams.get('q') ?? '',
  }));

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      tab: parseTabParam(searchParams.get('tab')),
      tier: parseTierParam(searchParams.get('tier')),
      category: parseCategoryParam(searchParams.get('category')),
      searchQuery: searchParams.get('q') ?? '',
    }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    const loadProducts = async (): Promise<void> => {
      setLoading(true);
      const result = await productRepository.getAll();
      if (active) {
        setProducts(result);
        setLoading(false);
      }
    };

    void loadProducts();

    const handleReset = (): void => {
      void loadProducts();
    };
    window.addEventListener(DEMO_RESET_EVENT, handleReset);

    return () => {
      active = false;
      window.removeEventListener(DEMO_RESET_EVENT, handleReset);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const typeCounts = useMemo(() => countProductsByType(products), [products]);
  const categoryCounts = useMemo(
    () => countProductsByCategory(products, filters.tab),
    [products, filters.tab],
  );
  const tierCounts = useMemo(
    () => countProductsByTier(products, filters.tab),
    [products, filters.tab],
  );
  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters, currency),
    [products, filters, currency],
  );

  const isFiltered = hasActiveCatalogFilters(filters);

  const resetFilters = (): void => {
    setFilters((prev) => ({
      ...DEFAULT_CATALOG_FILTERS,
      tab: prev.tab,
    }));
  };

  const tabItems: Array<{ id: CatalogTab; label: string; count: number }> = [
    { id: 'component', label: t.library.tabComponents, count: typeCounts.component },
    { id: 'template', label: t.library.tabTemplates, count: typeCounts.template },
  ];

  const activeCategoryHeading =
    filters.category !== 'all'
      ? t.library.sidebar.categories[filters.category]
      : filters.tab === 'template'
        ? t.library.tabTemplates
        : t.library.tabComponents;

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-canvas lg:flex lg:h-[calc(100vh-65px)] lg:flex-col lg:overflow-hidden">
      {/* Full-bleed Sub-header Bar (pinned on desktop above the split panes) */}
      <div className="w-full shrink-0 border-b border-white/[0.08] bg-[#070709]/95 backdrop-blur">
        <div className="flex w-full flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 sm:px-6 lg:grid lg:grid-cols-[1fr_minmax(320px,480px)_1fr] lg:items-center lg:gap-4">
          {/* Binary Segmented Tabs: Components | Templates ONLY (No "All" option) */}
          <div
            role="tablist"
            aria-label="Product type filter"
            className="order-1 flex items-center gap-1.5 lg:justify-self-start"
          >
            {tabItems.map((tab) => {
              const active = filters.tab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      tab: tab.id,
                      category: 'all',
                    }))
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white/[0.09] text-white font-semibold'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      active ? 'text-accent-cyan' : 'text-zinc-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Centered Search Input (⌘K) */}
          <div className="relative order-2 min-w-[180px] flex-1 md:mx-auto md:max-w-md lg:w-full lg:max-w-none lg:justify-self-center">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="library-search"
              name="q"
              type="search"
              value={filters.searchQuery}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, searchQuery: event.target.value }))
              }
              placeholder={t.library.searchPlaceholder}
              aria-label={t.library.searchPlaceholder}
              className="h-8 w-full rounded-lg border border-white/10 bg-[#0d0d11] pl-8 pr-10 text-xs text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none sm:h-9"
            />
            {filters.searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                aria-label={t.library.searchClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline-block">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Mobile & Tablet Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className="order-3 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#0d0d11] px-3 text-xs font-medium text-zinc-200 hover:border-white/25 sm:h-9 lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            <span>
              {mobileFiltersOpen
                ? t.library.mobileFilterHide
                : t.library.mobileFilterButton}
            </span>
          </button>

          {/* Desktop Right Spacer so Search remains centered horizontally */}
          <div className="hidden lg:order-3 lg:block" aria-hidden="true" />
        </div>
      </div>

      {/* Full-bleed 2-Pane Workspace: Fixed Independent-Scroll Left Sidebar + Independent-Scroll Right Grid */}
      <div className="flex w-full flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
        {/* Left Sidebar (Fixed beside grid on desktop with dedicated thin scrollbar) */}
        <aside
          aria-label="Catalog filters"
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden'
          } forma-scrollbar w-full border-b border-white/[0.08] bg-[#070709]/60 px-4 py-5 sm:px-6 lg:block lg:h-full lg:w-[250px] lg:shrink-0 lg:overflow-y-scroll lg:border-b-0 lg:border-r lg:px-4 lg:py-5 xl:w-[268px]`}
        >
          {/* Categories with Pill Count Badges */}
          <div>
            <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              {t.library.sidebar.categoriesHeading}
            </h2>
            <ul className="mt-2.5 space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    filters.category === 'all'
                      ? 'bg-white/[0.09] font-medium text-white'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <span>{t.library.sidebar.allCategories}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
                      filters.category === 'all'
                        ? 'bg-accent-cyan/15 text-accent-cyan'
                        : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {categoryCounts.all}
                  </span>
                </button>
              </li>
              {ORDERED_CATEGORIES.map((category) => {
                const count = categoryCounts[category];
                if (count === 0 && filters.category !== category) {
                  return null;
                }
                const active = filters.category === category;
                return (
                  <li key={category}>
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, category }))}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        active
                          ? 'bg-white/[0.09] font-medium text-white'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <span>{t.library.sidebar.categories[category]}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
                          active
                            ? 'bg-accent-cyan/15 text-accent-cyan'
                            : 'bg-white/[0.06] text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pricing Tier with Pill Count Badges */}
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              {t.library.sidebar.tierHeading}
            </h2>
            <div className="mt-2.5 space-y-0.5">
              {(
                [
                  { id: 'all', label: t.library.sidebar.tierAll, count: tierCounts.all },
                  { id: 'free', label: t.library.sidebar.tierFree, count: tierCounts.free },
                  { id: 'paid', label: t.library.sidebar.tierPaid, count: tierCounts.paid },
                ] as const
              ).map((option) => {
                const active = filters.tier === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, tier: option.id }))
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      active
                        ? 'bg-white/[0.09] font-medium text-white'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
                        active
                          ? 'bg-accent-cyan/15 text-accent-cyan'
                          : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Workspace: Compact Single-Row Header + Fluid Card Grid (Independent Scroll on Desktop) */}
        <div className="forma-scrollbar min-w-0 flex-1 px-4 py-6 sm:px-6 lg:h-full lg:overflow-y-auto lg:px-7">
          {/* Compact Single-Row Title + Sort Dropdown */}
          <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {activeCategoryHeading}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {isFiltered ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-surface px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>{t.library.clearFilters}</span>
                </button>
              ) : null}

              <div className="flex items-center gap-2">
                <label
                  htmlFor="library-sort"
                  className="text-xs text-zinc-400"
                >
                  {t.library.sortLabel}:
                </label>
                <select
                  id="library-sort"
                  name="sort"
                  aria-label={t.library.sortLabel}
                  value={filters.sortBy}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: event.target.value as CatalogSortOption,
                    }))
                  }
                  className="h-8 rounded-lg border border-white/10 bg-[#0d0d11] px-2.5 text-xs font-medium text-zinc-200 focus:border-accent-cyan focus:outline-none sm:w-44"
                >
                  <option value="newest">{t.library.sortOptions.newest}</option>
                  <option value="price-asc">{t.library.sortOptions.priceAsc}</option>
                  <option value="price-desc">{t.library.sortOptions.priceDesc}</option>
                  <option value="name-asc">{t.library.sortOptions.nameAsc}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="mt-6">
              <p className="mb-4 text-xs text-zinc-500">{t.library.loadingLabel}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex h-72 animate-pulse flex-col justify-between rounded-xl border border-white/[0.08] bg-surface p-4"
                  >
                    <div className="h-4 w-28 rounded bg-white/10" />
                    <div className="h-40 w-full rounded-lg bg-white/[0.05]" />
                    <div className="h-4 w-20 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surface px-6 py-16 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#141418] text-zinc-400">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-white">
                {t.library.emptyTitle}
              </h2>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
                {t.library.emptyBody}
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="mt-5"
                onClick={resetFilters}
              >
                {t.library.emptyResetCta}
              </Button>
            </div>
          ) : (
            /* Responsive Edge-to-Edge Product Grid */
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
