/**
 * Custom 3-column Metrics highlight strip rendered on the Homepage directly below the Hero
 * and above the Featured "Our Products" showcase section.
 *
 * Cấu trúc dễ tự chỉnh tay:
 * Toàn bộ kích thước (padding ngoài, bề rộng card, bo góc, cỡ chữ, kích thước avatar/toggle)
 * được gom gọn vào hằng số `METRICS_SIZE_CONFIG` ngay đầu file để bạn dễ dàng thay đổi
 * mà không cần tìm sửa rải rác trong JSX.
 *
 * Related: src/features/catalog/components/homepage-view.tsx
 */

'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';

/**
 * Bảng cấu hình kích thước cho khối Metrics (chỉnh trực tiếp tại đây để thu gọn / phóng to).
 */
const METRICS_SIZE_CONFIG = {
  /** Khoảng đệm trên/dưới và trái/phải của toàn bộ dải nền trắng bên ngoài. */
  sectionSpacing: 'px-4 py-8 sm:px-6 md:px-10 md:py-10',
  /** Bề rộng tối đa và độ bo góc của khung 3 cột (`max-w-5xl` | `max-w-6xl` | `max-w-7xl`). */
  cardContainer: 'max-w-5xl rounded-2xl',
  /** Khoảng đệm bên trong mỗi cột. */
  columnPadding: 'px-6 py-6 md:px-6 md:py-8',
  /** Khoảng cách dưới cụm icon / avatar đầu mỗi cột. */
  visualBottomGap: 'mb-4',
  /** Kích thước thanh gạt Pill Toggle ở Cột 1 (khớp với quãng trượt `TOGGLE_TRAVEL_PX`). */
  toggleTrack: 'h-[26px] w-[52px] p-[3px]',
  toggleKnob: 'h-[20px] w-[20px]',
  /** Kích thước ảnh đại diện ở Cột 2 và Cột 3 + độ xếp chồng âm. */
  avatar: 'h-9 w-9 rounded-full border-2 border-white object-cover',
  avatarOverlap: '-ml-3',
  /** Cỡ chữ con số lớn (95%, 1.9M+, 10K+). */
  numberHeading: 'mb-2 font-sans text-[32px] font-medium leading-none tracking-tight text-[#101111]',
  /** Cỡ chữ mô tả bên dưới con số. */
  captionText: 'text-sm leading-relaxed',
} as const;

/** Quãng dịch chuyển ngang (px) của nút tròn bên trong thanh Toggle: 52 - (3*2) - 20 = 26px. */
const TOGGLE_TRAVEL_PX = 26;

interface CounterProps {
  /** Target numeric value animated when scrolled into view. */
  value: number;
  /** Optional unit/suffix appended after the formatted number (e.g., `"%"`, `"M+"`, `"K+"`). */
  suffix?: string;
  /** Number of decimal digits displayed during interpolation. */
  decimals?: number;
}

/**
 * Spring-animated numeric counter triggered once the element enters the viewport.
 * Respects `prefers-reduced-motion` by jumping immediately to the target value when reduced.
 */
function Counter({ value, suffix = '', decimals = 0 }: CounterProps): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(prefersReducedMotion ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const displayValue = useTransform(springValue, (latest: number) =>
    latest.toFixed(decimals),
  );

  useEffect(() => {
    if (isInView || prefersReducedMotion) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue, prefersReducedMotion]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

interface MetricsProps {
  /** Optional extra wrapper classes appended to the full-width white section container. */
  className?: string;
}

/**
 * Compact 3-column metrics showcase card replacing the former Homepage audience strip.
 */
export function Metrics({ className }: MetricsProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={`w-full bg-white ${className ?? ''}`}>
      <div className={`w-full bg-white ${METRICS_SIZE_CONFIG.sectionSpacing}`}>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`group/bar mx-auto flex w-full flex-col items-stretch overflow-hidden border border-black/[0.06] bg-white md:flex-row ${METRICS_SIZE_CONFIG.cardContainer}`}
          id="metrics-bar"
        >
          {/* Column 1: Animated smiley pill toggle + 95% */}
          <div
            className={`group flex flex-1 flex-col items-center border-b border-gray-100 text-center transition-colors duration-300 hover:bg-gray-50/40 md:border-b-0 md:border-r ${METRICS_SIZE_CONFIG.columnPadding}`}
          >
            <div className={METRICS_SIZE_CONFIG.visualBottomGap}>
              <div
                className={`relative box-border flex items-center rounded-full bg-[#101111] ${METRICS_SIZE_CONFIG.toggleTrack}`}
              >
                <motion.div
                  animate={
                    prefersReducedMotion ? { x: 0 } : { x: [0, TOGGLE_TRAVEL_PX, 0] }
                  }
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`flex translate-x-0 items-center justify-center rounded-full bg-white ${METRICS_SIZE_CONFIG.toggleKnob}`}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#101111"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </motion.div>
              </div>
            </div>
            <h2 className={METRICS_SIZE_CONFIG.numberHeading}>
              <Counter value={95} suffix="%" />
            </h2>
            <div className={`max-w-[180px] text-gray-400 ${METRICS_SIZE_CONFIG.captionText}`}>
              <p>report less stress</p>
              <p>
                within <span className="font-semibold text-[#101111]">14 days</span>
              </p>
            </div>
          </div>

          {/* Column 2: Overlapping user avatars + 1.9M+ */}
          <div
            className={`group flex flex-1 flex-col items-center border-b border-gray-100 text-center transition-colors duration-300 hover:bg-gray-50/40 md:border-b-0 md:border-r ${METRICS_SIZE_CONFIG.columnPadding}`}
          >
            <div className={`flex items-center ${METRICS_SIZE_CONFIG.visualBottomGap}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Community member portrait 1"
                width={36}
                height={36}
                loading="lazy"
                className={METRICS_SIZE_CONFIG.avatar}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Community member portrait 2"
                width={36}
                height={36}
                loading="lazy"
                className={`${METRICS_SIZE_CONFIG.avatarOverlap} ${METRICS_SIZE_CONFIG.avatar}`}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/men/45.jpg"
                alt="Community member portrait 3"
                width={36}
                height={36}
                loading="lazy"
                className={`${METRICS_SIZE_CONFIG.avatarOverlap} ${METRICS_SIZE_CONFIG.avatar}`}
              />
            </div>
            <h2 className={METRICS_SIZE_CONFIG.numberHeading}>
              <Counter value={1.9} suffix="M+" decimals={1} />
            </h2>
            <div className={`max-w-[200px] text-gray-400 ${METRICS_SIZE_CONFIG.captionText}`}>
              <p>Trusted by millions of</p>
              <p>
                users across <span className="font-semibold text-[#101111]">90 countries</span>
              </p>
            </div>
          </div>

          {/* Column 3: Overlapping instructor avatars + 10K+ */}
          <div
            className={`group flex flex-1 flex-col items-center text-center transition-colors duration-300 hover:bg-gray-50/40 ${METRICS_SIZE_CONFIG.columnPadding}`}
          >
            <div className={`flex items-center ${METRICS_SIZE_CONFIG.visualBottomGap}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="Certified instructor portrait 1"
                width={36}
                height={36}
                loading="lazy"
                className={METRICS_SIZE_CONFIG.avatar}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/women/65.jpg"
                alt="Certified instructor portrait 2"
                width={36}
                height={36}
                loading="lazy"
                className={`${METRICS_SIZE_CONFIG.avatarOverlap} ${METRICS_SIZE_CONFIG.avatar}`}
              />
            </div>
            <h2 className={METRICS_SIZE_CONFIG.numberHeading}>
              <Counter value={10} suffix="K+" />
            </h2>
            <div className={`max-w-[210px] ${METRICS_SIZE_CONFIG.captionText}`}>
              <p className="font-semibold text-[#101111]">
                Certified instructors <span className="font-normal text-gray-300">&amp;</span>
              </p>
              <p className="text-gray-400">mental health specialists</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
