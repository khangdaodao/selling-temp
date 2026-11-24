/**
 * Miniature card artwork & inline interactive demos for forma/ catalog cards.
 * - Delegates `interactive-card` products (`Signal Button`, `Prism Switch`, `Kinetic Metric Card`,
 *   `Voices`) directly to the shared Controlled Preview Registry components in `compact` mode
 *   so interactive logic is never duplicated.
 * - Renders reference-matching miniature visuals for complex sections and templates.
 * - Displays an explicit mock-fallback placeholder when `previewComponentKey === null`.
 *
 * Related: src/features/preview/registry/interactive-demos.tsx, src/features/catalog/components/catalog-product-card.tsx
 */

'use client';

import { Terminal } from 'lucide-react';
import {
  KineticMetricDemo,
  PrismSwitchDemo,
  SignalButtonDemo,
  VoicesTestimonialsDemo,
} from '@/features/preview/registry/interactive-demos';
import { useI18n } from '@/i18n/use-i18n-store';
import type { Product } from '@/types/domain';

interface ProductCardVisualProps {
  product: Product;
  /** Compact height variant used in Library cards vs taller Homepage cards. */
  compact?: boolean;
  /** Renders edge-to-edge without outer border or rounded corners (used in Library cards). */
  flush?: boolean;
}

function getVisualFrameClass(
  heightClass: string,
  flush: boolean,
  defaultBorderClass: string,
): string {
  return flush
    ? `${heightClass} w-full overflow-hidden`
    : `${heightClass} w-full overflow-hidden rounded-lg border ${defaultBorderClass}`;
}

/**
 * Renders reference-matching thumbnails or compact interactive React Registry demos per product.
 */
export function ProductCardVisual({
  product,
  compact = false,
  flush = false,
}: ProductCardVisualProps): React.JSX.Element {
  const { t } = useI18n();
  const heightClass = compact ? 'h-44' : 'h-44 sm:h-48';

  if (product.previewComponentKey === null) {
    return (
      <div
        className={`flex ${heightClass} w-full flex-col items-center justify-center gap-2 bg-[#09090c] px-4 text-center ${
          flush ? '' : 'rounded-lg border border-dashed border-white/15'
        }`}
      >
        <Terminal className="h-5 w-5 text-accent-cyan" aria-hidden="true" />
        <p className="text-xs font-medium text-zinc-200">{product.name}</p>
        <span className="whitespace-nowrap rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 font-mono text-[10px] text-accent-cyan">
          {t.library.fallbackBadge} · No Live Registry
        </span>
      </div>
    );
  }

  switch (product.previewComponentKey) {
    case 'component-signal-button':
      return (
        <div className={getVisualFrameClass(heightClass, flush, 'border-white/[0.08]')}>
          <SignalButtonDemo theme="dark" compact />
        </div>
      );

    case 'component-prism-toggle':
      return (
        <div className={getVisualFrameClass(heightClass, flush, 'border-white/[0.08]')}>
          <PrismSwitchDemo theme="dark" compact />
        </div>
      );

    case 'component-kinetic-card':
      return (
        <div className={getVisualFrameClass(heightClass, flush, 'border-white/[0.08]')}>
          <KineticMetricDemo theme="dark" compact />
        </div>
      );

    case 'component-voices-cards':
      return (
        <div className={getVisualFrameClass(heightClass, flush, 'border-white/[0.08]')}>
          <VoicesTestimonialsDemo theme="light" compact />
        </div>
      );

    case 'template-orbit':
      return (
        <div
          className={`relative flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#0b0b0e] p-4 text-white`}
        >
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="font-semibold text-zinc-200">orbit</span>
            <span className="rounded bg-white px-2 py-0.5 text-[9px] font-medium text-zinc-950">
              Start free
            </span>
          </div>
          <div className="my-auto grid grid-cols-12 items-end gap-2">
            <div className="col-span-7">
              <p className="text-sm font-semibold leading-tight tracking-tight text-white">
                Less busywork.
                <br />
                More momentum.
              </p>
            </div>
            <div className="col-span-5 rounded border border-white/10 bg-[#121216] p-2">
              <p className="font-mono text-[10px] font-semibold text-zinc-200">$24,680</p>
              <div className="mt-1.5 flex h-8 items-end gap-1">
                {[35, 50, 45, 70, 65, 95].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 rounded-t-[2px] bg-zinc-400"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="h-1 w-16 rounded-full bg-white/10" />
        </div>
      );

    case 'template-northbound':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#f4f4f5] p-4 text-zinc-950`}
        >
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="font-semibold text-zinc-900">northbound</span>
            <span>Studio · Work</span>
          </div>
          <p className="text-sm font-semibold leading-snug tracking-tight text-zinc-950">
            Independent minds.
            <br />
            Extraordinary brands.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="truncate rounded bg-zinc-200/80 px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-zinc-700">
              NORTH OF ORDINARY
            </div>
            <div className="truncate rounded bg-zinc-900 px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-zinc-100">
              PHILOSOPHY
            </div>
          </div>
        </div>
      );

    case 'template-metric':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#fafafa] p-3.5 text-zinc-950`}
        >
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-zinc-900">Good morning, Alex.</span>
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[9px] text-zinc-700">
              Live
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Revenue', val: '$48,210' },
              { label: 'Active', val: '1,842' },
              { label: 'Retain', val: '94.2%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded border border-zinc-200 bg-white p-1.5">
                <p className="text-[8px] text-zinc-500">{stat.label}</p>
                <p className="font-mono text-[10px] font-semibold text-zinc-950">{stat.val}</p>
              </div>
            ))}
          </div>
          <div className="flex h-9 items-end gap-1 rounded border border-zinc-200 bg-white p-1.5">
            {[30, 55, 42, 72, 64, 88, 95, 76].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="flex-1 rounded-t-[2px] bg-zinc-800"
              />
            ))}
          </div>
        </div>
      );

    case 'component-halo-hero':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#ebebef] p-4 text-zinc-950`}
        >
          <div className="flex items-center justify-between text-[9px] text-zinc-500">
            <span className="font-semibold text-zinc-900">halo</span>
            <span>Product · Pricing</span>
          </div>
          <div className="my-auto text-center">
            <p className="text-base font-semibold leading-tight tracking-tight text-zinc-950">
              Make room for
              <br />
              something great.
            </p>
          </div>
          <div className="flex justify-center">
            <span className="rounded-full bg-zinc-950 px-3 py-1 text-[9px] font-medium text-white">
              Get started
            </span>
          </div>
        </div>
      );

    case 'component-pulse-hero':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#b8b8be] p-4 text-zinc-950`}
        >
          <div className="flex items-center justify-between text-[9px] text-zinc-700">
            <span className="font-semibold text-zinc-950">pulse</span>
            <span>Releases</span>
          </div>
          <div className="my-auto">
            <p className="text-lg font-bold leading-tight tracking-tight text-zinc-950">
              Let&apos;s make
              <br />
              some noise.
            </p>
            <p className="mt-2 text-[9px] font-medium text-zinc-800 underline">
              Explore launch →
            </p>
          </div>
          <div />
        </div>
      );

    case 'component-nexus-grid':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#f6f6f7] p-3.5 text-zinc-950`}
        >
          <div>
            <p className="text-xs font-semibold leading-tight text-zinc-950">
              A little of everything.
              <br />
              Beautifully connected.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {['Sync', 'Scale', 'Ship'].map((item) => (
              <div
                key={item}
                className="rounded border border-zinc-200 bg-white p-2 text-center"
              >
                <div className="mx-auto mb-1.5 h-5 w-full rounded bg-zinc-200" />
                <p className="text-[9px] font-semibold text-zinc-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'component-priceless-table':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#121216] p-3.5 text-white`}
        >
          <p className="text-center text-xs font-semibold text-zinc-100">
            Good work. Fair pricing.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded border border-white/10 bg-[#1a1a20] p-2">
              <p className="font-mono text-xs font-semibold text-zinc-200">$0</p>
              <p className="mt-1 text-[8px] text-zinc-400">Starter</p>
            </div>
            <div className="rounded border border-white/30 bg-white p-2 text-zinc-950">
              <p className="font-mono text-xs font-bold">$19</p>
              <p className="mt-1 text-[8px] font-medium text-zinc-700">Pro</p>
            </div>
            <div className="rounded border border-white/10 bg-[#1a1a20] p-2">
              <p className="font-mono text-xs font-semibold text-zinc-200">$49</p>
              <p className="mt-1 text-[8px] text-zinc-400">Team</p>
            </div>
          </div>
        </div>
      );

    case 'component-monolith-hero':
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#111114] p-4 text-white`}
        >
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">
            Monolith 09
          </span>
          <div className="my-auto">
            <p className="text-lg font-semibold leading-tight tracking-tight text-white">
              Different by
              <br />
              design.
            </p>
          </div>
          <div className="flex justify-end">
            <span className="rounded-md bg-white px-2.5 py-1 text-[9px] font-semibold text-zinc-950">
              Launch →
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`flex ${getVisualFrameClass(heightClass, flush, 'border-white/10')} flex-col justify-between bg-[#0b0b0e] p-4 text-white`}
        >
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="font-mono uppercase">{product.category}</span>
            <span>{product.frameworks[0]}</span>
          </div>
          <div className="my-auto">
            <p className="text-base font-semibold tracking-tight text-white">
              {product.thumbnailSubtitle}
            </p>
            <p className="mt-1 text-[11px] text-zinc-400">{product.name}</p>
          </div>
          <div className="flex gap-1.5">
            <span className="h-1.5 w-10 rounded-full bg-accent-cyan/70" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
          </div>
        </div>
      );
  }
}
