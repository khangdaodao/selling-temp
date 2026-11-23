/**
 * Single-row Tech Stack horizontal marquee section positioned between "Our Products" and Footer.
 * Follows the owner's white-surface reference (`bg-white`, centered heading, dark pill CTA button,
 * and floating white rounded-square logo cards) adapted strictly to 1 seamless horizontal row.
 *
 * Cấu trúc dễ tự chỉnh tay:
 * Thay đổi kích thước section, cỡ chữ, kích thước ô icon trong `TECH_STACK_SIZE_CONFIG`.
 *
 * Related: src/features/catalog/components/homepage-view.tsx, src/app/globals.css
 */

'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/use-i18n-store';

/**
 * Bảng cấu hình kích thước dễ chỉnh tay cho khối Tech Stack.
 */
const TECH_STACK_SIZE_CONFIG = {
  /** Khoảng đệm trên/dưới của dải nền trắng Tech Stack. */
  sectionPadding: 'py-16 sm:py-20',
  /** Cỡ chữ tiêu đề chính giữa khối. */
  headingText: 'mx-auto max-w-md px-4 text-center text-3xl font-semibold leading-[1.16] tracking-tight text-[#101111] sm:text-4xl',
  /** Kích thước & kiểu nút pill đen ở giữa. */
  ctaPill: 'mt-6 inline-flex items-center justify-center rounded-full bg-[#242426] px-6 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-[#101111]',
  /** Kích thước mỗi ô icon vuông bo tròn bên trong hàng chạy ngang. */
  iconTile: 'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_14px_-4px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_-4px_rgba(0,0,0,0.12)] sm:h-[72px] sm:w-[72px]',
} as const;

interface TechStackItem {
  id: string;
  name: string;
  renderIcon: () => React.JSX.Element;
}

const TECH_STACK_ITEMS: readonly TechStackItem[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#111111" />
        <path
          d="M9 16V8l7.4 9.5M15 8v4.5"
          stroke="#ffffff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'react',
    name: 'React',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="2" fill="#00B8D9" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="#00B8D9" strokeWidth="1.5" />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.6"
          transform="rotate(60 12 12)"
          stroke="#00B8D9"
          strokeWidth="1.5"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.6"
          transform="rotate(120 12 12)"
          stroke="#00B8D9"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="#3178C6" />
        <path
          d="M7.5 11.5h5M10 11.5v6.5M14.5 13.3c0-1 .8-1.8 2-1.8 1 0 1.8.5 2 1.2m-4 4.1c.3.7 1.1 1.2 2.1 1.2 1.2 0 2-.7 2-1.7 0-2.1-4-1.1-4-3"
          stroke="#ffffff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.12 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.62 7.15 14.48 6 12 6Zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.12 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.62 13.15 9.48 12 7 12Z"
          fill="#06B6D4"
        />
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M8.5 3h3.5v6H8.5a3 3 0 0 1 0-6Z" fill="#F24E1E" />
        <path d="M12 3h3.5a3 3 0 0 1 0 6H12V3Z" fill="#FF7262" />
        <path d="M12 9h3.5a3 3 0 1 1 0 6H12V9Z" fill="#1ABCFE" />
        <path d="M8.5 9H12v6H8.5a3 3 0 0 1 0-6Z" fill="#A259FF" />
        <path d="M8.5 15H12v3a3 3 0 1 1-3.5-3Z" fill="#0ACF83" />
      </svg>
    ),
  },
  {
    id: 'motion',
    name: 'Motion',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#FFF04B" />
        <path d="M7 15V9l3.5 3.5L14 9v6" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="17" cy="14" r="1.4" fill="#111111" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#181717" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.2A9.8 9.8 0 0 0 8.9 21.3c.49.09.67-.21.67-.47v-1.66c-2.73.59-3.31-1.16-3.31-1.16-.45-1.13-1.09-1.43-1.09-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.87 1.5 2.29 1.07 2.85.82.09-.63.34-1.07.62-1.31-2.18-.25-4.47-1.09-4.47-4.85 0-1.07.38-1.95 1.01-2.64-.1-.25-.44-1.25.1-2.6 0 0 .82-.26 2.7 1.01a9.35 9.35 0 0 1 4.92 0c1.88-1.27 2.7-1.01 2.7-1.01.54 1.35.2 2.35.1 2.6.63.69 1.01 1.57 1.01 2.64 0 3.77-2.29 4.6-4.48 4.84.35.3.67.9.67 1.82v2.7c0 .26.18.57.68.47A9.8 9.8 0 0 0 12 2.2Z"
        />
      </svg>
    ),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M12 4L21 20H3L12 4Z" fill="#111111" />
      </svg>
    ),
  },
  {
    id: 'prisma',
    name: 'Prisma',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
        <path
          d="M12.2 3.2L4.8 15.8c-.3.5-.1 1.1.4 1.4l6.6 3.7c.4.2.9.2 1.3-.1l5.8-4c.4-.3.6-.8.4-1.3L13.7 3.3c-.3-.6-1.2-.7-1.5-.1Z"
          fill="#0C344B"
        />
        <path d="M12.7 6.3l4.3 9.7-4.3 2.9V6.3Z" fill="#5A67D8" />
      </svg>
    ),
  },
  {
    id: 'mysql',
    name: 'MySQL',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="6.5" rx="7.5" ry="3" stroke="#00758F" strokeWidth="1.8" />
        <path
          d="M4.5 6.5v11c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-11"
          stroke="#00758F"
          strokeWidth="1.8"
        />
        <path
          d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3"
          stroke="#F29111"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4.5" fill="#635BFF" />
        <path
          d="M14.7 10.1c-.9-.45-2-.65-2.9-.65-1.45 0-2.3.65-2.3 1.7 0 2.15 4.9 1.3 4.9 4.05 0 1.7-1.4 2.75-3.45 2.75-1.2 0-2.4-.3-3.25-.75v-2.1c.85.55 2 .9 3.1.9 1.05 0 1.6-.4 1.6-1.05 0-1.9-4.9-1.15-4.9-3.95 0-1.7 1.3-2.85 3.35-2.85 1.1 0 2.1.2 2.85.55v1.4Z"
          fill="#ffffff"
        />
      </svg>
    ),
  },
  {
    id: 'vscode',
    name: 'VS Code',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
        <path
          d="M16.8 3.5L20.5 5.3v13.4l-3.7 1.8L8.4 12.8l-3.6 2.7-1.8-.9V9.4l1.8-.9 3.6 2.7 8.4-7.7Z"
          fill="#007ACC"
        />
        <path d="M16.8 3.5v17l3.7-1.8V5.3l-3.7-1.8Z" fill="#005A9E" />
      </svg>
    ),
  },
];

/**
 * Single-row Tech Stack infinite marquee section rendered above Footer.
 */
export function TechStackMarquee(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <section
      aria-label={t.home.techStackTitle}
      className={`w-full overflow-hidden bg-white ${TECH_STACK_SIZE_CONFIG.sectionPadding}`}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className={TECH_STACK_SIZE_CONFIG.headingText}>
          {t.home.techStackTitle}
        </h2>

        <Link href="/library" className={TECH_STACK_SIZE_CONFIG.ctaPill}>
          {t.home.techStackCta}
        </Link>
      </div>

      {/* Single horizontal marquee row with smooth edge fade gradients */}
      <div className="group relative mt-10 w-full overflow-hidden py-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-28"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-28"
        />

        <div className="animate-forma-marquee flex w-max group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:justify-center">
          {/* Primary track */}
          <div className="flex shrink-0 items-center gap-4 pr-4 sm:gap-5 sm:pr-5 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-4">
            {TECH_STACK_ITEMS.map((item) => (
              <div
                key={item.id}
                title={item.name}
                aria-label={item.name}
                className={TECH_STACK_SIZE_CONFIG.iconTile}
              >
                {item.renderIcon()}
              </div>
            ))}
          </div>

          {/* Seamless duplicate track for continuous single-row marquee loop */}
          <div
            aria-hidden="true"
            className="flex shrink-0 items-center gap-4 pr-4 sm:gap-5 sm:pr-5 motion-reduce:hidden"
          >
            {TECH_STACK_ITEMS.map((item) => (
              <div
                key={`${item.id}-dup`}
                title={item.name}
                className={TECH_STACK_SIZE_CONFIG.iconTile}
              >
                {item.renderIcon()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
