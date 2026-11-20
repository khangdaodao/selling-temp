/**
 * Controlled interactive React demo components for forma/ UI Components.
 * Used both as inline live demos inside Library cards and expanded interactive stages
 * inside Product Detail and Fullscreen Live Preview.
 *
 * Security boundary: All components here are curated React code authored inside the app
 * (never dynamically evaluated from untrusted user ZIP bundles).
 *
 * Related: src/features/preview/registry/preview-registry.tsx, src/features/preview/types.ts
 */

'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Loader2,
  Sparkles,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import type { PreviewDemoProps } from '../types';

/**
 * Interactive Signal Button demo supporting Idle -> Verifying -> Verified states,
 * variant toggling, and click telemetry.
 */
export function SignalButtonDemo({
  theme,
  compact = false,
}: PreviewDemoProps): React.JSX.Element {
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified'>('idle');
  const [variant, setVariant] = useState<'cyan' | 'solid' | 'ghost'>('cyan');
  const [clicks, setClicks] = useState(0);

  const isLight = theme === 'light';

  const triggerSignal = (): void => {
    setClicks((prev) => prev + 1);
    if (status === 'verified') {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    window.setTimeout(() => {
      setStatus('verified');
    }, 320);
  };

  if (compact) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#09090c] px-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={triggerSignal}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
            status === 'verified'
              ? 'border-accent-cyan bg-accent-cyan/15 text-accent-cyan shadow-cyanGlow'
              : 'border-white/15 bg-white text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          {status === 'loading' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : status === 'verified' ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>
            {status === 'loading'
              ? 'Verifying...'
              : status === 'verified'
                ? 'Signal Verified'
                : 'Trigger Signal'}
          </span>
        </motion.button>
        <span className="font-mono text-[10px] text-zinc-500">
          Interactive clicks: {clicks}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[360px] w-full flex-col items-center justify-center gap-6 rounded-xl p-8 transition-colors ${
        isLight
          ? 'bg-zinc-100 text-zinc-950'
          : 'bg-[#08080b] text-white'
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(['cyan', 'solid', 'ghost'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setVariant(item)}
            className={`rounded-md border px-3 py-1 text-xs font-medium capitalize transition-colors ${
              variant === item
                ? isLight
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : 'border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan'
                : isLight
                  ? 'border-zinc-300 bg-white text-zinc-600 hover:text-zinc-950'
                  : 'border-white/10 bg-[#121216] text-zinc-400 hover:text-white'
            }`}
          >
            {item} style
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={triggerSignal}
        className={`inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-semibold transition-all ${
          status === 'verified'
            ? 'border-accent-cyan bg-accent-cyan text-zinc-950 shadow-cyanGlow'
            : variant === 'cyan'
              ? 'border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25'
              : variant === 'solid'
                ? isLight
                  ? 'border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800'
                  : 'border-white bg-white text-zinc-950 hover:bg-zinc-200'
                : isLight
                  ? 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-950'
                  : 'border-white/15 bg-white/5 text-white hover:border-white/35'
        }`}
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : status === 'verified' ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Zap className="h-4 w-4" aria-hidden="true" />
        )}
        <span>
          {status === 'loading'
            ? 'Dispatching Signal...'
            : status === 'verified'
              ? 'Signal Verified ✓ (Click to reset)'
              : 'Hover & Click Signal Button'}
        </span>
      </motion.button>

      <div
        className={`flex items-center gap-4 rounded-lg border px-4 py-2 font-mono text-xs ${
          isLight
            ? 'border-zinc-300 bg-white text-zinc-700'
            : 'border-white/10 bg-[#111116] text-zinc-400'
        }`}
      >
        <span>State: <strong className={isLight ? 'text-zinc-950' : 'text-white'}>{status}</strong></span>
        <span>•</span>
        <span>Interactions: <strong className="text-accent-cyan">{clicks}</strong></span>
      </div>
    </div>
  );
}

/**
 * Interactive Prism Switch & Billing Seat Calculator demo.
 */
export function PrismSwitchDemo({
  theme,
  compact = false,
}: PreviewDemoProps): React.JSX.Element {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [seats, setSeats] = useState(3);
  const isLight = theme === 'light';

  const unitPrice = billing === 'annual' ? 15 : 19;
  const total = unitPrice * seats;

  if (compact) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#09090c] px-4">
        <div
          role="radiogroup"
          aria-label="Billing period demo"
          className="inline-flex rounded-full border border-white/10 bg-[#131318] p-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={billing === 'monthly'}
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              billing === 'monthly'
                ? 'bg-white text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={billing === 'annual'}
            onClick={() => setBilling('annual')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              billing === 'annual'
                ? 'bg-accent-cyan text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Annual -20%
          </button>
        </div>
        <p className="font-mono text-xs text-zinc-300">
          ${unitPrice} / mo ({billing === 'annual' ? 'billed yearly' : 'flexible'})
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[360px] w-full flex-col items-center justify-center gap-6 rounded-xl p-8 transition-colors ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#08080b] text-white'
      }`}
    >
      <div
        role="radiogroup"
        aria-label="Billing frequency switch"
        className={`inline-flex rounded-full border p-1 ${
          isLight ? 'border-zinc-300 bg-white' : 'border-white/10 bg-[#131318]'
        }`}
      >
        {(['monthly', 'annual'] as const).map((mode) => {
          const active = billing === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setBilling(mode)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? mode === 'annual'
                    ? 'bg-accent-cyan text-zinc-950 shadow-sm'
                    : isLight
                      ? 'bg-zinc-950 text-white'
                      : 'bg-white text-zinc-950'
                  : isLight
                    ? 'text-zinc-600 hover:text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'monthly' ? 'Monthly Billing' : 'Annual (-20%)'}
            </button>
          );
        })}
      </div>

      <div
        className={`w-full max-w-sm rounded-xl border p-5 ${
          isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#111116]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500">Team Seats</span>
          <div className="flex items-center gap-2">
            {[1, 3, 5, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSeats(preset)}
                className={`rounded border px-2 py-0.5 font-mono text-xs transition-colors ${
                  seats === preset
                    ? 'border-accent-cyan bg-accent-cyan/15 text-accent-cyan font-semibold'
                    : isLight
                      ? 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      : 'border-white/10 text-zinc-400 hover:border-white/30'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.08] pt-4">
          <div>
            <p className="text-xs text-zinc-500">Estimated monthly total</p>
            <p className="font-mono text-2xl font-bold">${total}</p>
          </div>
          <span className="font-mono text-xs text-accent-cyan">
            ${unitPrice} × {seats} seats
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Kinetic Metric Card with selectable timeframes and hover bar tooltips.
 */
export function KineticMetricDemo({
  theme,
  compact = false,
}: PreviewDemoProps): React.JSX.Element {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const isLight = theme === 'light';

  const dataset = {
    '7D': { label: '$12,480', delta: '+14.2%', bars: [34, 48, 42, 68, 60, 84, 96] },
    '30D': { label: '$48,920', delta: '+28.6%', bars: [52, 58, 72, 65, 88, 92, 100] },
    '90D': { label: '$142,300', delta: '+41.0%', bars: [40, 54, 61, 75, 82, 91, 99] },
  }[range];

  if (compact) {
    return (
      <div className="flex h-full w-full flex-col justify-between bg-[#09090c] p-3.5 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Revenue</p>
            <p className="font-mono text-base font-semibold text-white">
              {dataset.label}
            </p>
          </div>
          <div className="inline-flex rounded border border-white/10 bg-[#131318] p-0.5">
            {(['7D', '30D'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                  range === item
                    ? 'bg-accent-cyan text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex h-14 items-end gap-1.5 pt-2">
          {dataset.bars.map((height, idx) => (
            <div
              key={idx}
              style={{ height: `${height}%` }}
              className="flex-1 rounded-sm bg-accent-cyan/75 transition-all duration-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[360px] w-full items-center justify-center rounded-xl p-6 sm:p-8 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#08080b] text-white'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-card ${
          isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#111116]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Net Revenue Telemetry
            </p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <p className="font-mono text-3xl font-bold">{dataset.label}</p>
              <span className="rounded-full bg-accent-cyan/15 px-2 py-0.5 font-mono text-xs font-semibold text-accent-cyan">
                {dataset.delta}
              </span>
            </div>
          </div>

          <div
            className={`inline-flex rounded-lg border p-1 ${
              isLight ? 'border-zinc-200 bg-zinc-100' : 'border-white/10 bg-[#09090c]'
            }`}
          >
            {(['7D', '30D', '90D'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                  range === item
                    ? 'bg-accent-cyan text-zinc-950 font-semibold'
                    : isLight
                      ? 'text-zinc-600 hover:text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex h-32 items-end gap-2.5">
          {dataset.bars.map((height, idx) => (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
              onFocus={() => setHoveredBar(idx)}
              aria-label={`Bar ${idx + 1}: ${height}% index`}
              style={{ height: `${height}%` }}
              className={`flex-1 rounded-t-md transition-all duration-200 ${
                hoveredBar === idx ? 'bg-accent-cyan' : 'bg-accent-cyan/60 hover:bg-accent-cyan/90'
              }`}
            />
          ))}
        </div>

        <p className="mt-4 font-mono text-xs text-zinc-500">
          {hoveredBar !== null
            ? `Period #${hoveredBar + 1}: ${dataset.bars[hoveredBar]}% relative peak`
            : 'Hover or focus any bar to inspect period index'}
        </p>
      </div>
    </div>
  );
}

/**
 * Interactive Voices customer testimonial cards with category filter & upvote interaction.
 */
export function VoicesTestimonialsDemo({
  theme,
  compact = false,
}: PreviewDemoProps): React.JSX.Element {
  const [selected, setSelected] = useState<number>(0);
  const [upvotes, setUpvotes] = useState<Record<number, number>>({ 0: 18, 1: 24 });
  const isLight = theme === 'light';

  const quotes = [
    {
      quote: '"Clean tokens, accessible keyboard focus, zero bloat."',
      author: 'Alex Rivera',
      role: 'Staff Frontend Engineer',
    },
    {
      quote: '"Shipped our SaaS marketing site 3x faster with Orbit & Voices."',
      author: 'Maya Lin',
      role: 'Design Founder',
    },
  ];

  if (compact) {
    return (
      <div className="flex h-full w-full flex-col justify-between bg-zinc-100 p-3.5 text-zinc-950">
        <p className="text-center text-xs font-semibold tracking-tight text-zinc-900">
          Good words. Great people.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {quotes.map((item, index) => {
            const active = selected === index;
            return (
              <button
                key={item.author}
                type="button"
                onClick={() => setSelected(index)}
                className={`rounded-md border p-2 text-left transition-all ${
                  active
                    ? 'border-zinc-950 bg-white shadow-sm'
                    : 'border-zinc-300 bg-zinc-50 opacity-75 hover:opacity-100'
                }`}
              >
                <p className="text-[10px] font-medium leading-snug text-zinc-900">
                  {item.quote}
                </p>
                <p className="mt-1.5 text-[9px] text-zinc-500">{item.author}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[360px] w-full flex-col items-center justify-center rounded-xl p-6 sm:p-8 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#08080b] text-white'
      }`}
    >
      <p className="text-center text-lg font-semibold tracking-tight">
        Good words. Great people.
      </p>
      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {quotes.map((item, idx) => {
          const active = selected === idx;
          return (
            <div
              key={item.author}
              onClick={() => setSelected(idx)}
              className={`cursor-pointer rounded-xl border p-5 transition-all ${
                active
                  ? isLight
                    ? 'border-zinc-950 bg-white shadow-md'
                    : 'border-accent-cyan bg-[#14141a] shadow-cyanGlow'
                  : isLight
                    ? 'border-zinc-200 bg-white/80 hover:border-zinc-400'
                    : 'border-white/10 bg-[#101014] hover:border-white/25'
              }`}
            >
              <p className="text-sm leading-relaxed">{item.quote}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{item.author}</p>
                  <p className="text-[11px] text-zinc-500">{item.role}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setUpvotes((prev) => ({
                      ...prev,
                      [idx]: (prev[idx] ?? 0) + 1,
                    }));
                  }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    isLight
                      ? 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-900'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-accent-cyan'
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                  <span>{upvotes[idx] ?? 0}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
