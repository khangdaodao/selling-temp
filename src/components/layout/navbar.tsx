/**
 * Primary navigation bar for forma/, closely following the Homepage and Library reference screens.
 * Highlights the active route (`/` or `/library`), routes CTAs to `/library`, provides a responsive
 * mobile drawer with quick locale/currency toggles, and marks Phase 1.3+ routes clearly.
 *
 * TODO(Phase 1.3): Point Login, About, and Support links to dedicated routes once created.
 *
 * Related: src/components/ui/button.tsx, src/i18n/use-i18n-store.ts
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';

/**
 * Responsive sticky application header built with forma/ dark minimalism tokens.
 */
export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const { t, locale, currency, setLocale, setCurrency } = useI18n();
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
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={handleDeferredRoute}
            title={t.nav.comingSoonNote}
            className="px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            {t.nav.signIn}
          </button>
          <Button variant="cyan" size="sm" asChild>
            <Link href="/library">
              <span>{t.nav.exploreLibrary}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-surface text-zinc-200 transition-colors hover:border-white/25 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleDeferredRoute();
                setMobileMenuOpen(false);
              }}
            >
              {t.nav.signIn}
            </Button>
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
