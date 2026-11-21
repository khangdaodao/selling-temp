/**
 * Support & FAQ route (`/support`) entrypoint for forma/ Phase 1.
 * Thin App Router Server Component exporting SEO metadata and delegating UI to `SupportView`.
 *
 * Related: src/components/layout/secondary-views.tsx
 */

import type { Metadata } from 'next';
import { SupportView } from '@/components/layout/secondary-views';

export const metadata: Metadata = {
  title: 'Support & FAQ — forma/',
  description:
    'Frequently asked questions about forma/ demo flows, Lifetime Updates, dual pricing, and localStorage reset.',
};

/**
 * `/support` Server Component page shell.
 */
export default function SupportPage(): React.JSX.Element {
  return <SupportView />;
}
