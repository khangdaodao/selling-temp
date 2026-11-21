/**
 * Custom Next.js App Router global Error Boundary (`error.tsx`) for forma/.
 * Captures unexpected client/route errors and offers clean recovery options: retry rendering
 * or wipe `localStorage` demo keys (`resetAllDemoData`) and return safely to `/`.
 *
 * Related: src/lib/storage/storage-adapter.ts, src/i18n/use-i18n-store.ts
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';
import { resetAllDemoData } from '@/lib/storage/storage-adapter';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Client-side Error Boundary recovering gracefully without leaking internal stack traces.
 */
export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorProps): React.JSX.Element {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    console.error('[forma/ ErrorBoundary]', error);
  }, [error]);

  const handleResetDemoAndReturn = (): void => {
    resetAllDemoData();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[68vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-300">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <Badge variant="outline" className="mt-4 font-mono">
        {t.systemPages.errorBadge}
      </Badge>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {t.systemPages.errorTitle}
      </h1>
      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-zinc-400">
        {t.systemPages.errorBody}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="cyan" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {t.systemPages.retryCta}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleResetDemoAndReturn}>
          {t.systemPages.resetAndHomeCta}
        </Button>
      </div>
    </div>
  );
}
