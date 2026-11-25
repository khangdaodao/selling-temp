/**
 * Dark minimalist footer for `forma/` with top newsletter signup row,
 * brand summary, 3 structured route columns, and copyright/demo boundary bar.
 * Rendered exclusively on the Homepage (`/`) and hidden on all secondary routes.
 *
 * Related: src/i18n/use-i18n-store.ts, src/app/layout.tsx
 * Phase 1 Notice: Newsletter form demonstrates UI feedback only without backend API or persistence.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react';
import { ArrowRight, Mail } from 'lucide-react';
import { useI18n } from '@/i18n/use-i18n-store';
import { cn } from '@/lib/utils';

interface FooterProps {
  /** Optional additional classes merged into the outer `<footer>` element. */
  className?: string;
}

interface FooterNavItem {
  label: string;
  href: string;
  highlight?: boolean;
}

interface FooterNavColumn {
  id: string;
  title: string;
  items: FooterNavItem[];
}

const NEWSLETTER_FEEDBACK_MS = 3000;

const footerContainerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const footerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

/**
 * Homepage `forma/` footer featuring a top newsletter signup bar,
 * a 12-column link directory, and a Phase 1 copyright/boundary footer strip.
 * Suppressed on all non-Homepage routes (`/library`, `/login`, `/about`, `/support`, etc.).
 */
export function Footer({ className }: FooterProps): React.JSX.Element | null {
  const { t } = useI18n();
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  /**
   * Handles Phase 1 demo newsletter signup with temporary confirmation state.
   */
  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!email.trim()) return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    setSubscribed(true);
    resetTimerRef.current = setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, NEWSLETTER_FEEDBACK_MS);
  };

  const linkColumns: FooterNavColumn[] = [
    {
      id: 'products',
      title: t.footer.columns.productsTitle,
      items: [
        { label: t.footer.columns.productsLinks.library, href: '/library' },
        { label: t.footer.columns.productsLinks.components, href: '/library?tab=component' },
        { label: t.footer.columns.productsLinks.templates, href: '/library?tab=template' },
        { label: t.footer.columns.productsLinks.freebies, href: '/library?tier=free' },
      ],
    },
    {
      id: 'workspace',
      title: t.footer.columns.companyTitle,
      items: [
        { label: t.footer.columns.companyLinks.about, href: '/about' },
        { label: t.footer.columns.companyLinks.support, href: '/support' },
        { label: t.footer.columns.companyLinks.account, href: '/account' },
        { label: t.footer.columns.companyLinks.admin, href: '/admin', highlight: true },
      ],
    },
    {
      id: 'policies',
      title: t.footer.columns.legalTitle,
      items: [
        { label: t.footer.columns.legalLinks.license, href: '/support' },
        { label: t.footer.columns.legalLinks.updates, href: '/support' },
        { label: t.footer.columns.legalLinks.privacy, href: '/about' },
      ],
    },
  ];

  const motionState = shouldReduceMotion || isInView ? 'visible' : 'hidden';

  if (pathname !== '/') {
    return null;
  }

  return (
    <footer
      ref={containerRef}
      id="footer-section"
      className={cn(
        'w-full overflow-hidden border-t border-white/[0.08] bg-[#050505] text-white',
        className,
      )}
    >
      <motion.div
        variants={footerContainerVariants}
        initial={shouldReduceMotion ? 'visible' : 'hidden'}
        animate={motionState}
        className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-8 pt-14 sm:px-6 lg:pt-20"
      >
        {/* Top Newsletter Row */}
        <div className="mb-12 flex w-full flex-col items-start justify-between gap-8 lg:mb-14 lg:flex-row lg:items-center">
          <motion.div variants={footerItemVariants} className="max-w-[480px]">
            <h3 className="text-[26px] font-semibold leading-[1.2] tracking-tight text-white sm:text-[34px]">
              {t.footer.newsletter.heading}
            </h3>
          </motion.div>

          <motion.form
            onSubmit={handleSubscribe}
            variants={footerItemVariants}
            className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:gap-4 lg:w-auto"
          >
            <div className="flex h-[52px] w-full items-center rounded-none border border-neutral-800 bg-transparent px-4 transition-colors duration-200 hover:border-neutral-700 focus-within:border-neutral-500 sm:h-[56px] sm:min-w-[300px] md:min-w-[360px]">
              <Mail className="mr-3 h-5 w-5 shrink-0 text-neutral-500" aria-hidden="true" />
              <input
                type="email"
                name="newsletter-email"
                required
                aria-label={t.footer.newsletter.emailLabel}
                placeholder={t.footer.newsletter.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-[15px] font-normal text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              aria-live="polite"
              className="flex h-[52px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-none bg-white px-8 text-[15px] font-semibold text-[#050505] transition-all duration-200 hover:bg-neutral-200 active:scale-[0.98] sm:h-[56px]"
            >
              <span>{subscribed ? t.footer.newsletter.subscribed : t.footer.newsletter.subscribe}</span>
              {!subscribed && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
            </button>
          </motion.form>
        </div>

        {/* Top Divider */}
        <motion.div variants={footerItemVariants} className="mb-12 h-px w-full bg-white/[0.08] lg:mb-14" />

        {/* Middle Main Content Row */}
        <motion.div
          variants={footerItemVariants}
          className="mb-12 grid w-full grid-cols-1 gap-10 lg:mb-14 lg:grid-cols-12 lg:gap-8"
        >
          {/* Brand Summary (Left 5 cols) */}
          <div className="flex flex-col items-start gap-4 lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              <span>forma</span>
              <span className="text-accent-cyan">/</span>
            </Link>
            <p className="max-w-[340px] text-[15px] leading-relaxed text-zinc-400">
              {t.footer.tagline}
            </p>
          </div>

          {/* Structured Route Columns (Right 7 cols) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {linkColumns.map((column) => (
              <div key={column.id} className="flex flex-col items-start gap-4">
                <h4 className="text-[15px] font-semibold tracking-wide text-white">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {column.items.map((item) => (
                    <li key={`${column.id}-${item.label}`}>
                      <Link
                        href={item.href}
                        className={cn(
                          'text-[14px] text-zinc-400 transition-colors duration-200',
                          item.highlight ? 'hover:text-accent-cyan' : 'hover:text-white',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Legal & Demo Boundary Row */}
        <motion.div
          variants={footerItemVariants}
          className="flex flex-col items-start justify-between gap-3 border-t border-white/[0.08] pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:pt-8"
        >
          <p>{t.footer.copyright}</p>
          <p>{t.footer.demoNote}</p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
