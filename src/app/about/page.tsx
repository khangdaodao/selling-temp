/**
 * About route (`/about`) entrypoint for forma/ Phase 1.
 * Thin App Router Server Component exporting SEO metadata and delegating UI to `AboutView`.
 *
 * Related: src/components/layout/secondary-views.tsx
 */

import type { Metadata } from 'next';
import { AboutView } from '@/components/layout/secondary-views';

export const metadata: Metadata = {
  title: 'About — forma/',
  description:
    'Architecture philosophy, Personal Store model, and Phase 1 Demo-First boundaries of forma/.',
};

/**
 * `/about` Server Component page shell.
 */
export default function AboutPage(): React.JSX.Element {
  return <AboutView />;
}
