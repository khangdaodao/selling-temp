/**
 * Lazy-loaded React section & template demos inside the Controlled Preview Registry.
 * Renders interactive previews for complex UI sections (Hero, Navbar, Pricing, Footer, Bento)
 * and React-based website templates (`Metric`, `Atelier`, `Mono Folio`, `Kestrel Docs`)
 * inside Fullscreen Live Preview.
 *
 * Related: src/features/preview/registry/preview-registry.tsx, src/features/preview/types.ts
 */

'use client';

import { useState } from 'react';
import { ArrowRight, Check, Mail, Menu, ShoppingBag, X } from 'lucide-react';
import type { PreviewDemoProps } from '../types';

/** Interactive Halo Hero section preview with live alignment & CTA state. */
export function HaloHeroDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [centered, setCentered] = useState(true);
  const [clicked, setClicked] = useState(false);
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[380px] rounded-xl p-8 transition-colors ${
        isLight ? 'bg-[#ebebef] text-zinc-950' : 'bg-[#09090c] text-white'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-4 text-xs">
        <span className="font-semibold">halo</span>
        <button
          type="button"
          onClick={() => setCentered((prev) => !prev)}
          className="rounded-md border border-current/20 px-2.5 py-1 text-[11px] font-medium hover:bg-current/5"
        >
          Align: {centered ? 'Centered' : 'Left-aligned'}
        </button>
      </div>

      <div className={`py-14 ${centered ? 'mx-auto max-w-xl text-center' : 'max-w-xl text-left'}`}>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Make room for something great.
        </h2>
        <p className={`mt-4 text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Switch alignment above or test the primary call-to-action state below.
        </p>
        <div className={`mt-7 flex gap-3 ${centered ? 'justify-center' : 'justify-start'}`}>
          <button
            type="button"
            onClick={() => setClicked((prev) => !prev)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-transform active:scale-95 ${
              isLight ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'
            }`}
          >
            {clicked ? 'Starter Kit Triggered ✓' : 'Get started'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Interactive Pulse Hero banner with release-notes drawer toggle. */
export function PulseHeroDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[380px] rounded-xl p-8 transition-colors ${
        isLight ? 'bg-[#d4d4d8] text-zinc-950' : 'bg-[#0c0c10] text-white'
      }`}
    >
      <div className="flex items-center justify-between text-xs opacity-75">
        <span className="font-semibold">pulse</span>
        <span>v2.4 Announcement</span>
      </div>

      <div className="py-12">
        <h2 className="text-4xl font-bold tracking-tight">
          Let&apos;s make some noise.
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
        >
          <span>{expanded ? 'Hide launch notes' : 'Explore launch notes'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {expanded ? (
          <div
            className={`mt-5 rounded-lg border p-4 text-xs ${
              isLight ? 'border-zinc-900/15 bg-white/80 text-zinc-800' : 'border-white/10 bg-[#141418] text-zinc-300'
            }`}
          >
            Release highlights: Next.js 15 App Router compatibility, Tailwind tokens, and zero runtime bloat.
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Interactive Nexus 3-column Bento Grid with feature card selector. */
export function NexusGridDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [activeCard, setActiveCard] = useState<string>('Sync');
  const isLight = theme === 'light';

  const items = [
    { name: 'Sync', desc: 'Instant token synchronization across components and themes.' },
    { name: 'Scale', desc: 'Modular Grid architecture adapting cleanly from 375px to 1440px.' },
    { name: 'Ship', desc: 'Copy-ready TypeScript strict files with zero external bloat.' },
  ];

  return (
    <div
      className={`min-h-[380px] rounded-xl p-6 sm:p-8 ${
        isLight ? 'bg-[#f6f6f7] text-zinc-950' : 'bg-[#08080b] text-white'
      }`}
    >
      <h2 className="text-2xl font-semibold tracking-tight">
        A little of everything. Beautifully connected.
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const active = activeCard === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveCard(item.name)}
              className={`rounded-xl border p-4 text-left transition-all ${
                active
                  ? isLight
                    ? 'border-zinc-950 bg-white shadow-md'
                    : 'border-accent-cyan bg-[#14141a]'
                  : isLight
                    ? 'border-zinc-200 bg-white/70 hover:border-zinc-400'
                    : 'border-white/10 bg-[#111115] hover:border-white/25'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent-cyan">
                {active ? 'Selected' : 'Module'}
              </span>
              <h3 className="mt-2 text-base font-semibold">{item.name}</h3>
              <p className={`mt-1.5 text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Interactive Priceless 3-tier pricing table with Monthly/Annual billing toggle. */
export function PricelessTableDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro');
  const isLight = theme === 'light';

  const plans = [
    { name: 'Starter', price: 0, perks: ['5 UI components', 'MIT license'] },
    { name: 'Pro', price: annual ? 15 : 19, perks: ['Full library access', 'Lifetime updates'], featured: true },
    { name: 'Team', price: annual ? 39 : 49, perks: ['Unlimited seats', 'Priority support'] },
  ];

  return (
    <div
      className={`min-h-[400px] rounded-xl p-6 sm:p-8 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#09090d] text-white'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Good work. Fair pricing.</h2>
        <button
          type="button"
          onClick={() => setAnnual((prev) => !prev)}
          className={`mt-3 rounded-full border px-3.5 py-1 text-xs font-medium ${
            isLight ? 'border-zinc-300 bg-white' : 'border-white/15 bg-[#141418]'
          }`}
        >
          Billing: <strong className="text-accent-cyan">{annual ? 'Annual (-20%)' : 'Monthly'}</strong> (Click to toggle)
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.name;
          return (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                plan.featured
                  ? isLight
                    ? 'border-zinc-950 bg-zinc-950 text-white'
                    : 'border-white/30 bg-white text-zinc-950'
                  : isLight
                    ? 'border-zinc-200 bg-white'
                    : 'border-white/10 bg-[#121217]'
              }`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{plan.name}</p>
                <p className="mt-2 font-mono text-3xl font-bold">${plan.price}</p>
                <ul className="mt-4 space-y-2 text-xs opacity-85">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(plan.name)}
                className="mt-6 w-full rounded-lg border border-current/20 py-2 text-xs font-semibold transition-colors hover:bg-current/10"
              >
                {isSelected ? `Selected (${plan.name})` : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Interactive Monolith dark hero demo. */
export function MonolithHeroDemo(): React.JSX.Element {
  const [launched, setLaunched] = useState(false);

  return (
    <div className="flex min-h-[380px] flex-col justify-between rounded-xl bg-[#0b0b0f] p-8 text-white">
      <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
        Monolith 09
      </span>
      <div>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Different by design.
        </h2>
        <p className="mt-3 max-w-md text-sm text-zinc-400">
          Asymmetric high-contrast dark hero crafted for creative studios and dev tools.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setLaunched((prev) => !prev)}
          className="rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          {launched ? 'Demo Launched ✓' : 'Launch Project →'}
        </button>
      </div>
    </div>
  );
}

/** Interactive Vector Navbar demo with responsive drawer preview inside stage. */
export function VectorNavbarDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('Components');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[340px] rounded-xl p-6 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#08080b] text-white'
      }`}
    >
      <div
        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
          isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#111116]'
        }`}
      >
        <span className="font-semibold">vector/</span>
        <div className="hidden gap-4 text-xs sm:flex">
          {['Overview', 'Components', 'Pricing', 'Docs'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded px-2 py-1 transition-colors ${
                activeTab === tab
                  ? 'bg-accent-cyan/15 font-semibold text-accent-cyan'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-label="Toggle navbar preview menu"
          className="rounded border border-current/15 p-1.5"
        >
          {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {drawerOpen ? (
        <div
          className={`mt-3 rounded-xl border p-4 text-xs ${
            isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#111116]'
          }`}
        >
          Drawer active — selected route: <strong className="text-accent-cyan">{activeTab}</strong>
        </div>
      ) : (
        <p className="mt-8 text-center text-xs text-zinc-500">
          Active route tab: <strong className="text-accent-cyan">{activeTab}</strong> • Click tabs or menu icon above to test.
        </p>
      )}
    </div>
  );
}

/** Interactive Baseline Footer demo with simulated newsletter subscription feedback. */
export function BaselineFooterDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [subscribed, setSubscribed] = useState(false);
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[340px] rounded-xl p-6 sm:p-8 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#08080b] text-white'
      }`}
    >
      <div
        className={`rounded-xl border p-6 ${
          isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#111116]'
        }`}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold">baseline/</p>
            <p className="mt-2 text-xs text-zinc-500">
              Clean 4-column minimalist footer architecture.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold">Release updates</p>
            <div className="mt-2 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-current/15 px-2.5 py-1.5 text-xs opacity-70">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                <span>you@studio.dev</span>
              </div>
              <button
                type="button"
                onClick={() => setSubscribed((prev) => !prev)}
                className="rounded-md bg-accent-cyan px-3 py-1.5 text-xs font-semibold text-zinc-950"
              >
                {subscribed ? 'Joined ✓' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Interactive Metric Dashboard template preview. */
export function MetricDashboardDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [period, setPeriod] = useState<'Today' | 'Month'>('Month');
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[400px] rounded-xl p-6 ${
        isLight ? 'bg-[#fafafa] text-zinc-950' : 'bg-[#09090d] text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Good morning, Alex.</h2>
          <p className="text-xs text-zinc-500">Interactive KPI template preview</p>
        </div>
        <button
          type="button"
          onClick={() => setPeriod((prev) => (prev === 'Today' ? 'Month' : 'Today'))}
          className="rounded-md border border-current/15 px-3 py-1.5 text-xs font-medium"
        >
          Window: {period}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Revenue', val: period === 'Month' ? '$48,210' : '$2,140' },
          { label: 'Active Users', val: period === 'Month' ? '1,842' : '312' },
          { label: 'Retention', val: period === 'Month' ? '94.2%' : '97.1%' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border p-4 ${
              isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#121217]'
            }`}
          >
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="mt-1 font-mono text-2xl font-bold">{kpi.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Interactive Atelier Store template demo with mini cart count simulation. */
export function AtelierStoreDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [bagCount, setBagCount] = useState(0);
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[380px] rounded-xl p-6 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#09090d] text-white'
      }`}
    >
      <div className="flex items-center justify-between border-b border-current/10 pb-4">
        <span className="font-semibold">ATELIER</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-current/15 px-3 py-1 font-mono text-xs">
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
          Bag ({bagCount})
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {['Mono Desk Lamp — $140', 'Ceramic Vessel — $65'].map((item) => (
          <div
            key={item}
            className={`rounded-xl border p-4 ${
              isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#121217]'
            }`}
          >
            <p className="text-sm font-medium">{item}</p>
            <button
              type="button"
              onClick={() => setBagCount((prev) => prev + 1)}
              className="mt-4 rounded-md bg-accent-cyan px-3 py-1.5 text-xs font-semibold text-zinc-950"
            >
              + Add to Bag
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Interactive Mono Folio developer portfolio demo. */
export function MonoFolioDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [selectedWork, setSelectedWork] = useState('Compiler UI');
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[360px] rounded-xl p-6 sm:p-8 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#09090d] text-white'
      }`}
    >
      <p className="font-mono text-xs text-accent-cyan">AVAILABLE FOR SELECT WORK</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Engineer &amp; Minimalist Designer.
      </h2>
      <div className="mt-6 space-y-2">
        {['Compiler UI', 'Zero-Latency Table', 'Forma Design Tokens'].map((work) => (
          <button
            key={work}
            type="button"
            onClick={() => setSelectedWork(work)}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
              selectedWork === work
                ? 'border-accent-cyan bg-accent-cyan/10 font-semibold'
                : 'border-current/10 hover:border-current/30'
            }`}
          >
            <span>{work}</span>
            <span className="font-mono text-xs opacity-60">2026</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Interactive Kestrel Docs template preview with sidebar page switcher. */
export function KestrelDocsDemo({ theme }: PreviewDemoProps): React.JSX.Element {
  const [section, setSection] = useState<'quickstart' | 'tokens'>('quickstart');
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[360px] rounded-xl p-6 ${
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-[#09090d] text-white'
      }`}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
        <div className="space-y-1 sm:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Docs</p>
          {(
            [
              { id: 'quickstart', label: 'Quickstart' },
              { id: 'tokens', label: 'Design Tokens' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`block w-full rounded px-2.5 py-1.5 text-left text-xs ${
                section === item.id ? 'bg-accent-cyan/15 font-semibold text-accent-cyan' : 'opacity-70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          className={`rounded-xl border p-5 sm:col-span-8 ${
            isLight ? 'border-zinc-200 bg-white' : 'border-white/10 bg-[#121217]'
          }`}
        >
          <h3 className="text-base font-semibold">
            {section === 'quickstart' ? 'Quickstart Installation' : 'Design Token System'}
          </h3>
          <p className="mt-2 text-xs text-zinc-500">
            {section === 'quickstart'
              ? 'Drop the component folder into src/components and import globals.css tokens.'
              : 'All obsidian surfaces and cyan accents are centralized in CSS custom variables.'}
          </p>
        </div>
      </div>
    </div>
  );
}
