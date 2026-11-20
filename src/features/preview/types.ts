/**
 * Shared TypeScript contracts for the Smart Hybrid Preview Registry and Fullscreen Preview.
 *
 * Related: src/features/preview/registry/preview-registry.tsx, src/types/domain.ts
 */

import type * as React from 'react';

/** Responsive viewport presets available inside the Fullscreen Live Preview toolbar. */
export type PreviewViewport = 'desktop' | 'tablet' | 'mobile';

/** Preview surface theme toggleable independently of the dark forma/ shell when supported. */
export type PreviewTheme = 'dark' | 'light';

/** Props injected into every controlled React demo component in the registry. */
export interface PreviewDemoProps {
  theme: PreviewTheme;
  /** Compact mode when rendered directly inside Library cards or compact stages. */
  compact?: boolean;
}

/** Registry entry describing how a `previewComponentKey` is safely rendered. */
export interface PreviewRegistryEntry {
  key: string;
  kind: 'react-component' | 'static-iframe';
  /** Static HTML path inside `/public` for isolated sandboxed iframe templates. */
  iframePath?: string;
  /** Lazy-loaded React component for controlled component/section demos. */
  Component?: React.ComponentType<PreviewDemoProps>;
}
