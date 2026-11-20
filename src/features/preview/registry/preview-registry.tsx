/**
 * Controlled Smart Hybrid Preview Registry for forma/.
 * Maps explicit `previewComponentKey` identifiers to either:
 * 1. Lazy-loaded controlled React components (`next/dynamic`) authored in-repo.
 * 2. Standalone static HTML templates rendered inside an isolated `<iframe sandbox="allow-scripts">`.
 * 3. Honest Mock Fallback UI when `previewComponentKey === null` or unknown.
 *
 * Security boundary: Never compiles or executes untrusted user-uploaded ZIP bundles.
 * Sandboxed iframes omit `allow-same-origin` so preview scripts cannot access parent
 * `localStorage`, cookies, or DOM.
 *
 * Related: src/features/preview/registry/interactive-demos.tsx, src/features/preview/registry/section-demos.tsx
 */

'use client';

import dynamic from 'next/dynamic';
import { Layers, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';
import type { Product } from '@/types/domain';
import type { PreviewDemoProps, PreviewRegistryEntry, PreviewTheme } from '../types';

function RegistryLoadingBox(): React.JSX.Element {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[340px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#0b0b0f] p-8 text-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-accent-cyan" />
      <p className="font-mono text-xs text-zinc-400">{t.preview.loadingPreview}</p>
    </div>
  );
}

const LazySignalButtonDemo = dynamic<PreviewDemoProps>(
  () => import('./interactive-demos').then((mod) => mod.SignalButtonDemo),
  { loading: RegistryLoadingBox },
);
const LazyPrismSwitchDemo = dynamic<PreviewDemoProps>(
  () => import('./interactive-demos').then((mod) => mod.PrismSwitchDemo),
  { loading: RegistryLoadingBox },
);
const LazyKineticMetricDemo = dynamic<PreviewDemoProps>(
  () => import('./interactive-demos').then((mod) => mod.KineticMetricDemo),
  { loading: RegistryLoadingBox },
);
const LazyVoicesDemo = dynamic<PreviewDemoProps>(
  () => import('./interactive-demos').then((mod) => mod.VoicesTestimonialsDemo),
  { loading: RegistryLoadingBox },
);
const LazyHaloHeroDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.HaloHeroDemo),
  { loading: RegistryLoadingBox },
);
const LazyPulseHeroDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.PulseHeroDemo),
  { loading: RegistryLoadingBox },
);
const LazyNexusGridDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.NexusGridDemo),
  { loading: RegistryLoadingBox },
);
const LazyPricelessTableDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.PricelessTableDemo),
  { loading: RegistryLoadingBox },
);
const LazyMonolithHeroDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.MonolithHeroDemo),
  { loading: RegistryLoadingBox },
);
const LazyVectorNavbarDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.VectorNavbarDemo),
  { loading: RegistryLoadingBox },
);
const LazyBaselineFooterDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.BaselineFooterDemo),
  { loading: RegistryLoadingBox },
);
const LazyMetricDashboardDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.MetricDashboardDemo),
  { loading: RegistryLoadingBox },
);
const LazyAtelierStoreDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.AtelierStoreDemo),
  { loading: RegistryLoadingBox },
);
const LazyMonoFolioDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.MonoFolioDemo),
  { loading: RegistryLoadingBox },
);
const LazyKestrelDocsDemo = dynamic<PreviewDemoProps>(
  () => import('./section-demos').then((mod) => mod.KestrelDocsDemo),
  { loading: RegistryLoadingBox },
);

const PREVIEW_REGISTRY: Record<string, PreviewRegistryEntry> = {
  // Interactive component demos
  'component-signal-button': {
    key: 'component-signal-button',
    kind: 'react-component',
    Component: LazySignalButtonDemo,
  },
  'component-prism-toggle': {
    key: 'component-prism-toggle',
    kind: 'react-component',
    Component: LazyPrismSwitchDemo,
  },
  'component-kinetic-card': {
    key: 'component-kinetic-card',
    kind: 'react-component',
    Component: LazyKineticMetricDemo,
  },
  'component-voices-cards': {
    key: 'component-voices-cards',
    kind: 'react-component',
    Component: LazyVoicesDemo,
  },
  // Section & layout React demos
  'component-halo-hero': {
    key: 'component-halo-hero',
    kind: 'react-component',
    Component: LazyHaloHeroDemo,
  },
  'component-pulse-hero': {
    key: 'component-pulse-hero',
    kind: 'react-component',
    Component: LazyPulseHeroDemo,
  },
  'component-nexus-grid': {
    key: 'component-nexus-grid',
    kind: 'react-component',
    Component: LazyNexusGridDemo,
  },
  'component-priceless-table': {
    key: 'component-priceless-table',
    kind: 'react-component',
    Component: LazyPricelessTableDemo,
  },
  'component-monolith-hero': {
    key: 'component-monolith-hero',
    kind: 'react-component',
    Component: LazyMonolithHeroDemo,
  },
  'component-vector-nav': {
    key: 'component-vector-nav',
    kind: 'react-component',
    Component: LazyVectorNavbarDemo,
  },
  'component-baseline-footer': {
    key: 'component-baseline-footer',
    kind: 'react-component',
    Component: LazyBaselineFooterDemo,
  },
  // Standalone static HTML templates rendered inside sandboxed iframe
  'template-orbit': {
    key: 'template-orbit',
    kind: 'static-iframe',
    iframePath: '/demo-previews/orbit/index.html',
  },
  'template-northbound': {
    key: 'template-northbound',
    kind: 'static-iframe',
    iframePath: '/demo-previews/northbound/index.html',
  },
  // React-based template previews
  'template-metric': {
    key: 'template-metric',
    kind: 'react-component',
    Component: LazyMetricDashboardDemo,
  },
  'template-atelier': {
    key: 'template-atelier',
    kind: 'react-component',
    Component: LazyAtelierStoreDemo,
  },
  'template-monofolio': {
    key: 'template-monofolio',
    kind: 'react-component',
    Component: LazyMonoFolioDemo,
  },
  'template-kestreldocs': {
    key: 'template-kestreldocs',
    kind: 'react-component',
    Component: LazyKestrelDocsDemo,
  },
};

/**
 * Resolves the rendering mode for a given product's `previewComponentKey`.
 */
export function resolvePreviewKind(
  key: string | null,
): 'react-component' | 'static-iframe' | 'mock-fallback' {
  if (!key) {
    return 'mock-fallback';
  }
  const entry = PREVIEW_REGISTRY[key];
  if (!entry) {
    return 'mock-fallback';
  }
  return entry.kind;
}

interface PreviewCanvasProps {
  product: Product;
  theme: PreviewTheme;
  refreshKey: number;
  compact?: boolean;
}

/**
 * Renders the appropriate controlled live preview (React demo, sandboxed iframe,
 * or honest Mock Fallback screen) for a catalog product.
 */
export function PreviewCanvas({
  product,
  theme,
  refreshKey,
  compact = false,
}: PreviewCanvasProps): React.JSX.Element {
  const { t } = useI18n();
  const entry = product.previewComponentKey
    ? PREVIEW_REGISTRY[product.previewComponentKey]
    : undefined;

  if (!entry) {
    return (
      <div className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#09090d] px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#131318] px-3 py-1 font-mono text-[11px] text-zinc-300">
          <Layers className="h-3 w-3 text-accent-cyan" aria-hidden="true" />
          {t.preview.modeMockFallback}
        </span>
        <h2 className="mt-4 text-lg font-semibold text-white">
          {t.preview.fallbackTitle}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
          {t.preview.fallbackBody}
        </p>
        <Button variant="outline" size="sm" className="mt-6" asChild>
          <Link href={`/products/${product.slug}`}>{t.preview.fallbackBackCta}</Link>
        </Button>
      </div>
    );
  }

  if (entry.kind === 'static-iframe' && entry.iframePath) {
    const iframeSrc = `${entry.iframePath}?theme=${theme}&r=${refreshKey}`;
    return (
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#050505]">
        {/* Security: omit allow-same-origin so static template scripts cannot read parent storage/cookies */}
        <iframe
          key={`${product.id}-${theme}-${refreshKey}`}
          src={iframeSrc}
          title={`${product.name} isolated template preview`}
          sandbox="allow-scripts"
          loading="lazy"
          className="h-[640px] w-full border-0 bg-transparent"
        />
      </div>
    );
  }

  if (entry.Component) {
    const DemoComponent = entry.Component;
    return (
      <div key={`${product.id}-${refreshKey}`} className="w-full">
        <DemoComponent theme={theme} compact={compact} />
      </div>
    );
  }

  return <RegistryLoadingBox />;
}
