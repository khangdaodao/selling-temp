/**
 * Main interactive Library catalog client component matching Reference Screen #2.
 * Fetches catalog products through `productRepository.getAll()`, syncs URL search params,
 * supports `⌘K`/`Ctrl+K` quick search focus, tab switching (`All`/`Components`/`Templates`),
 * category/tier/framework sidebar filters, currency-aware sorting, loading and empty states.
 *
 * Related: src/app/library/page.tsx, src/features/catalog/catalog-utils.ts, src/services/index.ts
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
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
  FrameworkType,
  Product,
  ProductCategory,
  ProductTier,
} from '@/types/domain';
import {
  ORDERED_CATEGORIES,
  countProductsByCategory,
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
  if (raw === 'component' || raw === 'template') {
    return raw;
  }
  return 'all';
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
 * Interactive Library workspace with top toolbar, sticky filter sidebar, and 3-column grid.
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
  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters, currency),
    [products, filters, currency],
  );

  const isFiltered = hasActiveCatalogFilters(filters);

  const resetFilters = (): void => {
    setFilters(DEFAULT_CATALOG_FILTERS);
  };

  const tabItems: Array<{ id: CatalogTab; label: string; count: number }> = [
    { id: 'all', label: t.library.tabAll, count: typeCounts.all },
    { id: 'component', label: t.library.tabComponents, count: typeCounts.component },
    { id: 'template', label: t.library.tabTemplates, count: typeCounts.template },
  ];

  const frameworkOptions: Array<{ id: FrameworkType | 'all'; label: string }> = [
    { id: 'all', label: t.library.sidebar.frameworkAll },
    { id: 'nextjs', label: 'Next.js' },
    { id: 'react', label: 'React' },
    { id: 'tailwind', label: 'Tailwind CSS' },
  ];

  return (
    <div className="min-h-[75vh] bg-canvas">
      {/* Sticky Top Library Toolbar matching Reference Screen #2 */}
      <div className="border-b border-white/[0.08] bg-[#070709]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented Type Tabs */}
          <div
            role="tablist"
            aria-label="Product type filter"
            className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#0d0d11] p-1"
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
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      active
                        ? 'bg-zinc-950/10 text-zinc-900'
                        : 'bg-white/5 text-zinc-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Sort */}
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center lg:max-w-2xl lg:justify-end">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
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
                className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0d11] pl-9 pr-12 text-xs text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none sm:text-sm"
              />
              {filters.searchQuery.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  aria-label={t.library.searchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline-block">
                  ⌘K
                </kbd>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                className="h-9 w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 text-xs font-medium text-zinc-200 focus:border-accent-cyan focus:outline-none sm:w-44"
              >
                <option value="newest">{t.library.sortOptions.newest}</option>
                <option value="price-asc">{t.library.sortOptions.priceAsc}</option>
                <option value="price-desc">{t.library.sortOptions.priceDesc}</option>
                <option value="name-asc">{t.library.sortOptions.nameAsc}</option>
              </select>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                aria-expanded={mobileFiltersOpen}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#0d0d11] px-3 text-xs font-medium text-zinc-200 hover:border-white/25 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                <span>
                  {mobileFiltersOpen
                    ? t.library.mobileFilterHide
                    : t.library.mobileFilterButton}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Filter Sidebar */}
          <aside
            aria-label="Catalog filters"
            className={`${
              mobileFiltersOpen ? 'block' : 'hidden'
            } space-y-7 lg:col-span-3 lg:block`}
          >
            {/* Categories */}
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {t.library.sidebar.categoriesHeading}
              </h2>
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                      filters.category === 'all'
                        ? 'bg-white/10 font-medium text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                  >
                    <span>{t.library.sidebar.allCategories}</span>
                    <span className="font-mono text-[11px] text-zinc-500">
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
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                          active
                            ? 'bg-white/10 font-medium text-white'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                        }`}
                      >
                        <span>{t.library.sidebar.categories[category]}</span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Pricing Tier */}
            <div className="border-t border-white/[0.08] pt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {t.library.sidebar.tierHeading}
              </h2>
              <div className="mt-3 space-y-1">
                {(
                  [
                    { id: 'all', label: t.library.sidebar.tierAll },
                    { id: 'free', label: t.library.sidebar.tierFree },
                    { id: 'paid', label: t.library.sidebar.tierPaid },
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
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                        active
                          ? 'bg-white/10 font-medium text-white'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                      }`}
                    >
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Framework */}
            <div className="border-t border-white/[0.08] pt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {t.library.sidebar.frameworkHeading}
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {frameworkOptions.map((option) => {
                  const active = filters.framework === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, framework: option.id }))
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        active
                          ? 'border-accent-cyan/60 bg-accent-cyan/10 font-medium text-accent-cyan'
                          : 'border-white/10 bg-surface text-zinc-400 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Promo Box matching Reference Screen #2 */}
            <div className="rounded-xl border border-white/10 bg-[#0b0b0e] p-4">
              <p className="text-sm font-semibold leading-snug text-white">
                {t.library.sidebar.promoTitle}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.library.sidebar.promoBody}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between"
                onClick={() =>
                  setFilters({
                    ...DEFAULT_CATALOG_FILTERS,
                    tier: 'free',
                  })
                }
              >
                <span>{t.library.sidebar.promoCta}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <div className="lg:col-span-9">
            <div className="border-b border-white/[0.08] pb-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
                {t.library.eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {t.library.headline}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <p className="text-zinc-400">
                  {t.library.showingPrefix}{' '}
                  <span className="font-mono font-semibold text-white">
                    {filteredProducts.length}
                  </span>{' '}
                  / {products.length} {t.library.showingSuffix}
                </p>

                {isFiltered ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>{t.library.clearFilters}</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="mt-6">
                <p className="mb-4 text-xs text-zinc-500">{t.library.loadingLabel}</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surface px-6 py-16 text-center">
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
              /* Responsive 3-Column Product Grid */
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
