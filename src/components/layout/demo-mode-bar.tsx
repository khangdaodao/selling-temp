/**
 * Top Demo Mode disclosure bar displayed across Phase 1.
 * Communicates clearly that data persists locally via localStorage (not real backend),
 * provides quick locale/currency switching, and exposes a Reset Demo Data control
 * backed by `StorageAdapter.resetAllDemoData()`.
 *
 * Related: src/lib/storage/storage-adapter.ts, src/i18n/use-i18n-store.ts
 */

'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/use-i18n-store';
import { resetAllDemoData } from '@/lib/storage/storage-adapter';

/**
 * Persistent Phase 1 banner reminding users of simulated storage boundaries
 * and offering one-click demo state reset.
 */
export function DemoModeBar(): React.JSX.Element {
  const { t, locale, currency, setLocale, setCurrency } = useI18n();
  const [justReset, setJustReset] = useState(false);

  const handleReset = (): void => {
    resetAllDemoData();
    setJustReset(true);
    window.setTimeout(() => setJustReset(false), 2500);
  };

  return (
    <div className="border-b border-white/[0.08] bg-[#08080a] text-xs text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="cyan" className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {t.demoBar.badge}
          </Badge>
          <span className="text-zinc-400">{t.demoBar.notice}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center rounded-md border border-white/10 bg-surface p-0.5"
            role="group"
            aria-label={t.demoBar.localeLabel}
          >
            <button
              type="button"
              onClick={() => setLocale('vi', true)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                locale === 'vi'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLocale('en', true)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                locale === 'en'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <div
            className="inline-flex items-center rounded-md border border-white/10 bg-surface p-0.5"
            role="group"
            aria-label={t.demoBar.currencyLabel}
          >
            <button
              type="button"
              onClick={() => setCurrency('VND')}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                currency === 'VND'
                  ? 'bg-accent-cyan text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              VND
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                currency === 'USD'
                  ? 'bg-accent-cyan text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>{justReset ? t.demoBar.resetDone : t.demoBar.resetButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
