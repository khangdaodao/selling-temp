/**
 * Right-column overlapping hero showcase matching Homepage Reference Screen #1.
 * Composes the Orbit dark dashboard frame, overlapping Northbound light editorial card,
 * and floating live-interactive badge with restrained Motion entrance choreography.
 *
 * Related: src/features/catalog/components/homepage-view.tsx, src/i18n/use-i18n-store.ts
 */

'use client';

import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { useI18n } from '@/i18n/use-i18n-store';

/**
 * Overlapping dual-card Hero visual showcase on the Homepage right column.
 */
export function HomeHeroShowcase(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b0b0e] p-4 shadow-card sm:p-6"
    >
      {/* Background Dark Window: Orbit */}
      <div className="rounded-xl border border-white/10 bg-[#121216] p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-[11px] text-zinc-400">
          <span className="font-semibold tracking-tight text-white">orbit</span>
          <div className="hidden items-center gap-4 sm:flex">
            <span>Product</span>
            <span>Pricing</span>
            <span>Changelog</span>
          </div>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-zinc-950">
            Start free
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-7">
            <p className="text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">
              Less busywork.
              <br />
              More momentum.
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Clean operational visibility for product teams.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#0a0a0d] p-3 sm:col-span-5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>MRR</span>
              <span className="text-accent-cyan">+24%</span>
            </div>
            <p className="mt-1 font-mono text-base font-semibold text-white">$24,680</p>
            <div className="mt-2.5 flex h-12 items-end gap-1.5">
              {[38, 52, 46, 68, 60, 82, 96].map((height, idx) => (
                <span
                  key={idx}
                  style={{ height: `${height}%` }}
                  className="flex-1 rounded-t-[2px] bg-zinc-400/90"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping Light Card: Northbound */}
      <div className="relative z-10 ml-auto mt-4 w-full rounded-xl border border-black/10 bg-zinc-100 p-4 text-zinc-950 shadow-2xl sm:-mt-8 sm:w-[64%] sm:p-5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span className="font-semibold text-zinc-900">northbound</span>
          <span>Editorial</span>
        </div>
        <p className="mt-3 text-base font-semibold leading-snug tracking-tight text-zinc-950 sm:text-lg">
          Independent minds.
          <br />
          Extraordinary brands.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="truncate rounded-md bg-zinc-200/80 px-2 py-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-800">
            NORTH OF ORDINARY
          </div>
          <div className="truncate rounded-md bg-zinc-900 px-2 py-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-100">
            PHILOSOPHY
          </div>
        </div>
      </div>

      {/* Floating Bottom-Left Interactive Callout Badge */}
      <div className="mt-4 inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-[#09090c]/95 px-3 py-2 shadow-lg backdrop-blur sm:absolute sm:bottom-5 sm:left-4 sm:z-20 sm:mt-0 sm:max-w-[33%]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-cyan/15 text-accent-cyan">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{t.home.liveBadgeTitle}</p>
          <p className="truncate text-[10px] text-zinc-400">{t.home.liveBadgeSubtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}
