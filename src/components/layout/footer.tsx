/**
 * Global footer component matching the 4-column layout in the forma/ Homepage reference screen.
 * Displays the `forma/` wordmark and tagline on the left, 3 structured link columns on the right,
 * and a copyright + Phase 1 demo boundary notice at the bottom.
 *
 * TODO(Phase 1.3): Update Account, Admin, About, and Support links as routes are implemented.
 *
 * Related: src/i18n/use-i18n-store.ts, src/app/layout.tsx
 */

'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/use-i18n-store';

/**
 * Site-wide dark minimalist footer.
 */
export function Footer(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <footer className="border-t border-white/[0.08] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Summary */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center text-lg font-semibold tracking-tight text-white"
            >
              <span>forma</span>
              <span className="text-accent-cyan">/</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
              {t.footer.tagline}
            </p>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {t.footer.columns.productsTitle}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
                <li>
                  <Link href="/library" className="transition-colors hover:text-white">
                    {t.footer.columns.productsLinks.library}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library?tab=component"
                    className="transition-colors hover:text-white"
                  >
                    {t.footer.columns.productsLinks.components}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library?tab=template"
                    className="transition-colors hover:text-white"
                  >
                    {t.footer.columns.productsLinks.templates}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library?tier=free"
                    className="transition-colors hover:text-white"
                  >
                    {t.footer.columns.productsLinks.freebies}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {t.footer.columns.companyTitle}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    {t.footer.columns.companyLinks.about}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    {t.footer.columns.companyLinks.support}
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="transition-colors hover:text-white">
                    {t.footer.columns.companyLinks.account}
                  </Link>
                </li>
                <li>
                  <span className="text-zinc-500" title={t.nav.comingSoonNote}>
                    {t.footer.columns.companyLinks.admin}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {t.footer.columns.legalTitle}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
                <li>
                  <Link href="/library" className="transition-colors hover:text-white">
                    {t.footer.columns.legalLinks.license}
                  </Link>
                </li>
                <li>
                  <Link href="/library" className="transition-colors hover:text-white">
                    {t.footer.columns.legalLinks.updates}
                  </Link>
                </li>
                <li>
                  <Link href="/library" className="transition-colors hover:text-white">
                    {t.footer.columns.legalLinks.privacy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.08] pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>{t.footer.copyright}</p>
          <p>{t.footer.demoNote}</p>
        </div>
      </div>
    </footer>
  );
}
