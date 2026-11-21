/**
 * Custom global 404 Not Found page (`not-found.tsx`) for forma/.
 * Renders a branded Dark Minimalism 404 screen with quick navigation back to Library or Home.
 *
 * Related: src/components/layout/secondary-views.tsx
 */

import { NotFoundView } from '@/components/layout/secondary-views';

/**
 * Next.js App Router global 404 fallback component.
 */
export default function NotFoundPage(): React.JSX.Element {
  return <NotFoundView />;
}
