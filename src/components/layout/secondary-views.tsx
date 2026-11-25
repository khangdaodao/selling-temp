/**
 * Bilingual secondary view components for `/about`, `/support`, and custom 404 Not Found screens.
 * Keeps Next.js App Router pages thin while subscribing cleanly to `useI18n()`.
 *
 * Related: src/app/about/page.tsx, src/app/support/page.tsx, src/app/not-found.tsx
 */

'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Compass,
  HelpCircle,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';

/**
 * `/about` presentation view explaining the Personal Store model and Phase 1 boundaries.
 */
export function AboutView(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="forma-grid-bg min-h-[calc(100vh-65px)]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-6 sm:p-10">
          <Badge variant="cyan">{t.aboutPage.badge}</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.aboutPage.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {t.aboutPage.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="cyan" size="sm" asChild>
              <Link href="/library">
                <span>{t.aboutPage.exploreCta}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/support">{t.aboutPage.supportCta}</Link>
            </Button>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">{t.aboutPage.pillarsTitle}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {t.aboutPage.pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
              >
                <Layers className="h-5 w-5 text-accent-cyan" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5 text-xs leading-relaxed text-amber-200/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <div>
            <p className="font-semibold text-amber-200">{t.aboutPage.phaseBoundaryTitle}</p>
            <p className="mt-1">{t.aboutPage.phaseBoundaryBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * `/support` presentation view with bilingual FAQ and quick links to demo workspaces.
 */
export function SupportView(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="forma-grid-bg min-h-[calc(100vh-65px)]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-6 sm:p-10">
          <Badge variant="cyan">{t.supportPage.badge}</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.supportPage.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {t.supportPage.subtitle}
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">{t.supportPage.faqTitle}</h2>
          <div className="mt-4 space-y-3">
            {t.supportPage.faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
              >
                <h3 className="flex items-start gap-2 text-sm font-semibold text-white">
                  <HelpCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan"
                    aria-hidden="true"
                  />
                  <span>{item.q}</span>
                </h3>
                <p className="mt-2 pl-6 text-xs leading-relaxed text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b0b0f] p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-cyan" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-white">
                {t.supportPage.demoTipsTitle}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {t.supportPage.demoTipsBody}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="cyan" size="sm" asChild>
                  <Link href="/account">{t.supportPage.accountCta}</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">{t.supportPage.adminCta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Branded 404 Not Found view rendered cleanly inside the dark minimalism shell.
 */
export function NotFoundView(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-[68vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-cyan/35 bg-accent-cyan/10 text-accent-cyan">
        <Compass className="h-5 w-5" aria-hidden="true" />
      </div>
      <Badge variant="outline" className="mt-4 font-mono">
        {t.systemPages.notFoundCode}
      </Badge>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {t.systemPages.notFoundTitle}
      </h1>
      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-zinc-400">
        {t.systemPages.notFoundBody}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button variant="cyan" size="sm" asChild>
          <Link href="/library">{t.systemPages.browseLibraryCta}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">{t.systemPages.backHomeCta}</Link>
        </Button>
      </div>
    </div>
  );
}
