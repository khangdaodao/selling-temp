/**
 * Minimal Customer Account Dashboard (`/account`) for forma/ Phase 1.
 * Displays the active mock profile (with no stored password), quick stats,
 * and 4 horizontal tabs: `My Library`, `Orders`, `Wishlist`, and `Settings`.
 * Includes lazy-loaded read-only Monaco source viewing, sample ZIP downloads,
 * mock profile editing, sign out, and full demo data reset.
 *
 * Security boundary: All entitlements, orders, and profile edits live in browser localStorage
 * for Phase 1 UX simulation ONLY.
 *
 * Related: src/app/account/page.tsx, src/features/account/components/monaco-code-viewer.tsx
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Code2,
  Download,
  Heart,
  Lock,
  LogOut,
  PackageCheck,
  RotateCcw,
  Settings,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useWishlistStore } from '@/features/wishlist/use-wishlist-store';
import { pickLocalizedText, useI18n } from '@/i18n/use-i18n-store';
import { formatMoneyAmount, formatProductPrice } from '@/lib/format/currency';
import { resetAllDemoData } from '@/lib/storage/storage-adapter';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { productRepository } from '@/services';
import type { Product } from '@/types/domain';
import { MonacoCodeViewer } from './monaco-code-viewer';

type AccountTab = 'library' | 'orders' | 'wishlist' | 'settings';

/**
 * Customer Account Workspace with horizontal tabs for Library, Orders, Wishlist, and Settings.
 */
export function AccountView(): React.JSX.Element {
  const { t, locale, currency, setLocale, setCurrency } = useI18n();
  const session = useAuthStore((state) => state.session);
  const ownedProductIds = useAuthStore((state) => state.ownedProductIds);
  const orders = useAuthStore((state) => state.orders);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);

  const wishlistIds = useWishlistStore((state) => state.productIds);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<AccountTab>('library');
  const [viewerProductId, setViewerProductId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

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
      setViewerProductId(null);
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
      setProfileName(session.user.name);
      setProfileEmail(session.user.email);
    }
  }, [session]);

  const ownedProducts = useMemo(
    () => catalog.filter((item) => ownedProductIds.includes(item.id)),
    [catalog, ownedProductIds],
  );

  const wishlistedProducts = useMemo(
    () => catalog.filter((item) => wishlistIds.includes(item.id)),
    [catalog, wishlistIds],
  );

  const userOrders = useMemo(
    () => (session ? orders.filter((ord) => ord.userId === session.user.id) : []),
    [orders, session],
  );

  const handleSaveProfile = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      await updateProfile({ name: profileName });
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2400);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Unable to save profile updates.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-[75vh] bg-canvas py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="forma-surface rounded-2xl p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-white">
              {t.account.authGateTitle}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {t.account.authGateBody}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="cyan" size="default" asChild>
                <Link href="/login?next=/account">
                  <span>{t.account.authGateLoginCta}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AccountTab; label: string; count?: number }> = [
    { id: 'library', label: t.account.tabs.myLibrary, count: ownedProducts.length },
    { id: 'orders', label: t.account.tabs.orders, count: userOrders.length },
    { id: 'wishlist', label: t.account.tabs.wishlist, count: wishlistedProducts.length },
    { id: 'settings', label: t.account.tabs.settings },
  ];

  return (
    <div className="min-h-[82vh] bg-canvas pb-20 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Minimal Profile Header */}
        <div className="forma-surface flex flex-col justify-between gap-6 rounded-2xl p-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/15 font-mono text-sm font-bold text-accent-cyan">
              {session.user.avatarInitials}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.account.eyebrow}
                </span>
                <Badge variant="muted" className="text-[10px]">
                  {t.account.demoProfileBadge}
                </Badge>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {session.user.name}
              </h1>
              <p className="font-mono text-xs text-zinc-400">
                {session.user.email} · {session.user.role}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-4 border-r border-white/10 pr-4 text-center">
              <div>
                <p className="font-mono text-lg font-bold text-white">
                  {ownedProducts.length}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.account.statsOwned}
                </p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-white">
                  {userOrders.length}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.account.statsOrders}
                </p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-white">
                  {wishlistedProducts.length}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.account.statsWishlist}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.auth.signOut}</span>
            </Button>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <div
          role="tablist"
          aria-label="Account sections"
          className="mt-8 flex flex-wrap gap-2 border-b border-white/[0.08] pb-3"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      active
                        ? 'bg-zinc-950/10 text-zinc-900'
                        : 'bg-white/5 text-zinc-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Tab 1: My Library */}
        {activeTab === 'library' ? (
          <section className="mt-6 space-y-6">
            <p className="text-xs text-zinc-400">{t.account.latestZipOnlyNote}</p>

            {ownedProducts.length === 0 ? (
              <div className="forma-surface flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
                <PackageCheck className="h-8 w-8 text-zinc-500" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold text-white">
                  {t.account.emptyLibraryTitle}
                </h2>
                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
                  {t.account.emptyLibraryBody}
                </p>
                <Button variant="cyan" size="sm" className="mt-5" asChild>
                  <Link href="/library">{t.account.emptyLibraryCta}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ownedProducts.map((product) => {
                  const isViewerOpen = viewerProductId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="forma-surface overflow-hidden rounded-2xl p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="cyan">{t.cart.ownedBadge}</Badge>
                            <span className="font-mono text-[11px] text-zinc-500">
                              {product.frameworks.join(' · ')}
                            </span>
                          </div>
                          <h2 className="mt-2 text-lg font-semibold text-white">
                            <Link
                              href={`/products/${product.slug}`}
                              className="hover:text-accent-cyan"
                            >
                              {product.name}
                            </Link>
                          </h2>
                          <p className="mt-1 text-xs text-zinc-400">
                            {pickLocalizedText(product.shortDescription, locale)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant={isViewerOpen ? 'default' : 'cyan'}
                            size="sm"
                            onClick={() =>
                              setViewerProductId(isViewerOpen ? null : product.id)
                            }
                          >
                            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              {isViewerOpen
                                ? t.account.hideSourceCta
                                : t.account.viewSourceCta}
                            </span>
                          </Button>

                          {product.zipMetadata.sampleDownloadPath ? (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={product.zipMetadata.sampleDownloadPath}
                                download={product.zipMetadata.fileName}
                              >
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{t.account.downloadZipCta}</span>
                              </a>
                            </Button>
                          ) : (
                            <span className="rounded-md border border-white/10 bg-[#0b0b0f] px-3 py-1.5 text-[11px] text-zinc-500">
                              {t.account.zipUnavailableLabel}
                            </span>
                          )}

                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/preview/${product.slug}`}>
                              <span>Preview</span>
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {isViewerOpen ? (
                        <div className="mt-5 border-t border-white/[0.08] pt-5">
                          <MonacoCodeViewer product={product} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' ? (
          <section className="mt-6">
            {userOrders.length === 0 ? (
              <div className="forma-surface rounded-2xl px-6 py-14 text-center">
                <h2 className="text-base font-semibold text-white">
                  {t.account.emptyOrdersTitle}
                </h2>
                <p className="mt-1.5 text-xs text-zinc-400">
                  {t.account.emptyOrdersBody}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.map((ord) => {
                  const amount =
                    ord.currencyUsed === 'VND' ? ord.totalVnd : ord.totalUsd;
                  const statusLabel =
                    ord.status === 'paid'
                      ? t.checkout.statusPaid
                      : ord.status === 'failed'
                        ? t.checkout.statusFailed
                        : t.checkout.statusFreeClaimed;
                  return (
                    <div
                      key={ord.id}
                      className="forma-surface flex flex-wrap items-center justify-between gap-4 rounded-xl px-5 py-4 text-xs"
                    >
                      <div>
                        <p className="font-mono font-semibold text-white">{ord.id}</p>
                        <p className="mt-1 text-zinc-400">
                          {ord.items.map((item) => item.productName).join(', ')}
                          {ord.couponCode ? ` • Coupon: ${ord.couponCode}` : ''}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-zinc-500">
                          {new Date(ord.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={ord.status === 'failed' ? 'outline' : 'cyan'}>
                          {statusLabel}
                        </Badge>
                        <span className="font-mono text-sm font-semibold text-white">
                          {formatMoneyAmount(amount, ord.currencyUsed)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' ? (
          <section className="mt-6">
            {wishlistedProducts.length === 0 ? (
              <div className="forma-surface flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
                <Heart className="h-8 w-8 text-zinc-500" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold text-white">
                  {t.account.emptyWishlistTitle}
                </h2>
                <p className="mt-1.5 max-w-md text-xs text-zinc-400">
                  {t.account.emptyWishlistBody}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {wishlistedProducts.map((product) => {
                  const isOwned = ownedProductIds.includes(product.id);
                  const isInCart = cartItems.some((c) => c.productId === product.id);
                  return (
                    <div
                      key={product.id}
                      className="forma-surface flex flex-col justify-between gap-4 rounded-xl p-5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-base font-semibold text-white hover:text-accent-cyan"
                          >
                            {product.name}
                          </Link>
                          <span className="font-mono text-sm font-semibold text-accent-cyan">
                            {formatProductPrice(
                              product.priceVnd,
                              product.priceUsd,
                              currency,
                              t.library.freeLabel,
                            )}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-400">
                          {pickLocalizedText(product.shortDescription, locale)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/products/${product.slug}`}>
                              {t.library.viewDetailsLabel}
                            </Link>
                          </Button>

                          {!isOwned && product.tier === 'paid' ? (
                            <Button
                              type="button"
                              variant="cyan"
                              size="sm"
                              onClick={() => {
                                if (isInCart) {
                                  openDrawer();
                                } else {
                                  addItem(product.id, ownedProductIds);
                                }
                              }}
                            >
                              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>
                                {isInCart ? t.cart.inCartBadge : t.cart.addToCart}
                              </span>
                            </Button>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/5 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t.account.removeWishlistCta}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' ? (
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <form
              onSubmit={(e) => void handleSaveProfile(e)}
              className="forma-surface rounded-2xl p-6 lg:col-span-7"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white">
                  {t.account.settingsProfileHeading}
                </h2>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                {t.account.settingsProfileSub}
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="account-name"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    {t.account.settingsNameLabel}
                  </label>
                  <input
                    id="account-name"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#101014] px-3 text-sm text-white focus:border-accent-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="account-email"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    {t.account.settingsEmailLabel}
                  </label>
                  <input
                    id="account-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    readOnly
                    disabled
                    value={profileEmail}
                    className="mt-1.5 h-10 w-full cursor-not-allowed rounded-lg border border-white/10 bg-[#0b0b0f] px-3 text-sm text-zinc-400 opacity-80 focus:outline-none"
                  />
                </div>

                {profileError ? (
                  <p role="alert" className="text-xs text-rose-300">
                    {profileError}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button type="submit" variant="default" size="default" disabled={savingProfile}>
                    {t.account.settingsSaveCta}
                  </Button>
                  {savedNotice ? (
                    <span role="status" className="text-xs text-accent-cyan">
                      {t.account.settingsSavedNotice}
                    </span>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="space-y-5 lg:col-span-5">
              <div className="forma-surface rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {t.demoBar.localeLabel} &amp; {t.demoBar.currencyLabel}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="inline-flex rounded-lg border border-white/10 bg-[#0d0d11] p-1">
                    {(['vi', 'en'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLocale(lang, true)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${
                          locale === lang ? 'bg-white text-zinc-950' : 'text-zinc-400'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex rounded-lg border border-white/10 bg-[#0d0d11] p-1">
                    {(['VND', 'USD'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setCurrency(unit)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold ${
                          currency === unit
                            ? 'bg-accent-cyan text-zinc-950'
                            : 'text-zinc-400'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-6">
                <h2 className="text-sm font-semibold text-white">
                  {t.account.settingsDangerHeading}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  {t.account.settingsDangerBody}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => resetAllDemoData()}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.account.settingsResetCta}</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
