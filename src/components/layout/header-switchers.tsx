/**
 * Compact circular icon switchers for Currency (`VND` / `USD`) and Language (`Tiếng Việt` / `English`).
 * Positioned directly to the left of the Cart trigger inside `Navbar`, matching the minimal
 * icon-popover interaction pattern while adhering strictly to forma/'s Dark Minimalism + Cyan Accent tokens.
 *
 * Related: src/components/layout/navbar.tsx, src/i18n/use-i18n-store.ts
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Coins, Globe } from 'lucide-react';
import { useI18n } from '@/i18n/use-i18n-store';
import type { CurrencyCode, Locale } from '@/types/domain';

type OpenSwitcher = 'currency' | 'locale' | null;

const CURRENCY_OPTIONS: ReadonlyArray<{ id: CurrencyCode; label: string; symbol: string }> = [
  { id: 'VND', label: 'VND', symbol: '₫' },
  { id: 'USD', label: 'USD', symbol: '$' },
];

const LOCALE_OPTIONS: ReadonlyArray<{ id: Locale; label: string }> = [
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'en', label: 'English' },
];

/**
 * Renders Currency (Coins) and Language (Globe) circular icon toggles with dark-glass dropdown menus.
 */
export function HeaderSwitchers(): React.JSX.Element {
  const { t, locale, currency, setLocale, setCurrency } = useI18n();
  const [openMenu, setOpenMenu] = useState<OpenSwitcher>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const currencyOpen = openMenu === 'currency';
  const localeOpen = openMenu === 'locale';

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5">
      {/* Currency Switcher (Coins Icon) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((prev) => (prev === 'currency' ? null : 'currency'))}
          aria-haspopup="menu"
          aria-expanded={currencyOpen}
          aria-label={`${t.demoBar.currencyLabel}: ${currency}`}
          title={`${t.demoBar.currencyLabel}: ${currency}`}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all lg:h-9 lg:w-9 ${
            currencyOpen
              ? 'border-accent-cyan bg-accent-cyan text-zinc-950 shadow-cyanGlow'
              : 'border-white/10 bg-surface text-zinc-300 hover:border-white/25 hover:text-white'
          }`}
        >
          <Coins className="h-4 w-4" aria-hidden="true" />
        </button>

        {currencyOpen ? (
          <div
            role="menu"
            aria-label={t.demoBar.currencyLabel}
            className="absolute right-0 top-full z-50 mt-2.5 w-40 origin-top-right rounded-xl border border-white/15 bg-[#0c0c0f]/95 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {CURRENCY_OPTIONS.map((option) => {
              const selected = currency === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setCurrency(option.id);
                    setOpenMenu(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    selected
                      ? 'bg-accent-cyan/15 font-medium text-accent-cyan'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{option.label}</span>
                    <span className="text-[11px] opacity-65">{option.symbol}</span>
                  </span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Language Switcher (Globe Icon) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((prev) => (prev === 'locale' ? null : 'locale'))}
          aria-haspopup="menu"
          aria-expanded={localeOpen}
          aria-label={`${t.demoBar.localeLabel}: ${locale.toUpperCase()}`}
          title={`${t.demoBar.localeLabel}: ${locale === 'vi' ? 'Tiếng Việt' : 'English'}`}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all lg:h-9 lg:w-9 ${
            localeOpen
              ? 'border-accent-cyan bg-accent-cyan text-zinc-950 shadow-cyanGlow'
              : 'border-white/10 bg-surface text-zinc-300 hover:border-white/25 hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
        </button>

        {localeOpen ? (
          <div
            role="menu"
            aria-label={t.demoBar.localeLabel}
            className="absolute right-0 top-full z-50 mt-2.5 w-44 origin-top-right rounded-xl border border-white/15 bg-[#0c0c0f]/95 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {LOCALE_OPTIONS.map((option) => {
              const selected = locale === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setLocale(option.id, true);
                    setOpenMenu(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    selected
                      ? 'bg-accent-cyan/15 font-medium text-accent-cyan'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
