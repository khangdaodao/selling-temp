/**
 * Primary navigation bar for forma/, closely following the Homepage and Library reference screens.
 * Highlights active routes, exposes the Cart Drawer trigger with live item badge,
 * shows active Demo User state or `/login` link, and provides a responsive mobile drawer.
 *
 * TODO(Phase 1.6): Point About and Support links to dedicated routes once created.
 *
 * Related: src/features/cart/components/cart-drawer.tsx, src/features/auth/use-auth-store.ts
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, LogOut, Menu, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useI18n } from '@/i18n/use-i18n-store';

/**
 * Responsive sticky application header built with forma/ dark minimalism tokens.
 */
export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const { t, locale, currency, setLocale, setCurrency } = useI18n();
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const cartItems = useCartStore((state) => state.items);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const navItems = [
    { label: t.nav.home, href: '/', active: pathname === '/', ready: true },
    {
      label: t.nav.library,
      href: '/library',
      active: pathname.startsWith('/library'),
      ready: true,
    },
    { label: t.nav.about, href: '#coming-soon', active: false, ready: false },
    { label: t.nav.support, href: '#coming-soon', active: false, ready: false },
  ];

  const handleDeferredRoute = (): void => {
    setPendingNotice(t.nav.comingSoonNote);
    window.setTimeout(() => setPendingNotice(null), 2600);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="inline-flex items-center text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <span>forma</span>
          <span className="text-accent-cyan">/</span>
        </Link>

        {/* Centered Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) =>
            item.ready ? (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 text-sm transition-colors ${
                  item.active
                    ? 'font-medium text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
                {item.active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-[2px] bg-white"
                  />
                ) : null}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={handleDeferredRoute}
                title={t.nav.comingSoonNote}
                className="py-1 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={openDrawer}
            aria-label={t.cart.title}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            <span className="font-mono">{cartItems.length}</span>
          </button>

          {session ? (
            <div className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-surface pl-2 pr-1 py-1">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 rounded pr-1 text-xs text-zinc-200 transition-colors hover:text-accent-cyan"
                title={t.account.tabs.myLibrary}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-cyan/15 font-mono text-[10px] font-bold text-accent-cyan">
                  {session.user.avatarInitials}
                </span>
                <span className="max-w-[110px] truncate">{session.user.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label={t.auth.signOut}
                title={t.auth.signOut}
                className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              {t.nav.signIn}
            </Link>
          )}

          <Button variant="cyan" size="sm" asChild>
            <Link href="/library">
              <span>{t.nav.exploreLibrary}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Mobile Actions & Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={openDrawer}
            aria-label={t.cart.title}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 text-xs font-medium text-zinc-200"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            <span className="font-mono">{cartItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-surface text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {pendingNotice ? (
        <div
          role="status"
          className="border-t border-accent-cyan/20 bg-accent-cyan/10 px-4 py-1.5 text-center text-xs text-accent-cyan"
        >
          {pendingNotice}
        </div>
      ) : null}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen ? (
        <div className="border-t border-white/[0.08] bg-[#09090b] px-4 py-4 md:hidden">
          <nav aria-label="Mobile Primary" className="flex flex-col gap-2">
            {navItems.map((item) =>
              item.ready ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm transition-colors ${
                    item.active
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    handleDeferredRoute();
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </button>
              ),
            )}
          </nav>

          {/* Mobile quick locale & currency switchers */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-4">
            <div className="inline-flex rounded-md border border-white/10 bg-surface p-0.5">
              {(['vi', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLocale(lang, true)}
                  className={`rounded px-2.5 py-1 text-xs font-medium uppercase ${
                    locale === lang ? 'bg-white text-zinc-950' : 'text-zinc-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-md border border-white/10 bg-surface p-0.5">
              {(['VND', 'USD'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setCurrency(unit)}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    currency === unit
                      ? 'bg-accent-cyan text-zinc-950 font-semibold'
                      : 'text-zinc-400'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
            {session ? (
              <div className="flex items-center justify-between rounded-md border border-white/10 bg-surface px-3 py-2 text-xs">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="truncate font-medium text-white hover:text-accent-cyan"
                >
                  {session.user.name}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  {t.auth.signOut}
                </button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  {t.nav.signIn}
                </Link>
              </Button>
            )}
            <Button variant="cyan" size="sm" asChild>
              <Link href="/library" onClick={() => setMobileMenuOpen(false)}>
                <span>{t.nav.exploreLibrary}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
