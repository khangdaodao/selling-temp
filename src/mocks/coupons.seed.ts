/**
 * Preset promotional discount coupons for Phase 1 Checkout simulation.
 * Security boundary: Client-side validation is for demo UX only.
 *
 * TODO(Phase 2): Validate and calculate coupon discounts strictly on the server inside
 * a database transaction before creating a payment intent.
 *
 * Related: src/types/domain.ts, src/services/repositories/mock-coupon.repository.ts
 */

import type { Coupon } from '@/types/domain';

export const SEED_COUPONS: Coupon[] = [
  {
    code: 'FORMA20',
    discountPercent: 20,
    active: true,
    description: {
      vi: 'Giảm 20% toàn bộ đơn hàng bản demo.',
      en: '20% off your entire demo checkout order.',
    },
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  {
    code: 'WELCOME10',
    discountPercent: 10,
    active: true,
    description: {
      vi: 'Ưu đãi chào mừng thành viên mới (giảm 10%).',
      en: 'New member welcome discount (10% off).',
    },
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  {
    code: 'EXPIRED50',
    discountPercent: 50,
    active: false,
    description: {
      vi: 'Mã hết hạn dùng để kiểm thử trạng thái lỗi coupon.',
      en: 'Expired/inactive coupon for testing invalid coupon handling.',
    },
    expiresAt: '2025-01-01T00:00:00.000Z',
  },
];
