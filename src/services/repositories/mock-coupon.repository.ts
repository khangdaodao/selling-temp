/**
 * Phase 1 localStorage-backed mock implementation of `ICouponRepository`.
 *
 * TODO(Phase 2): Move coupon verification and redemption counters to server-side MySQL transactions.
 *
 * Related: src/services/repositories/interfaces.ts, src/mocks/coupons.seed.ts
 */

import { readStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import { SEED_COUPONS } from '@/mocks/coupons.seed';
import type { Coupon, CouponValidationResult } from '@/types/domain';
import type { ICouponRepository } from './interfaces';

function isCouponArray(value: unknown): value is Coupon[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Coupon).code === 'string' &&
        typeof (item as Coupon).discountPercent === 'number',
    )
  );
}

function loadCouponsSnapshot(): Coupon[] {
  const stored = readStorage<Coupon[] | null>(
    STORAGE_KEYS.coupons,
    null,
    (val): val is Coupon[] | null => val === null || isCouponArray(val),
  );
  if (stored === null || stored.length === 0) {
    return [...SEED_COUPONS];
  }
  return stored;
}

export class MockCouponRepository implements ICouponRepository {
  /** @inheritdoc */
  async getAll(): Promise<Coupon[]> {
    return loadCouponsSnapshot();
  }

  /** @inheritdoc */
  async validateCode(rawCode: string): Promise<CouponValidationResult> {
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      return { valid: false, coupon: null, reason: 'empty' };
    }

    const coupons = loadCouponsSnapshot();
    const coupon = coupons.find((item) => item.code.toUpperCase() === normalized) ?? null;
    if (!coupon) {
      return { valid: false, coupon: null, reason: 'not_found' };
    }

    if (!coupon.active) {
      return { valid: false, coupon, reason: 'inactive' };
    }

    if (Date.parse(coupon.expiresAt) < Date.now()) {
      return { valid: false, coupon, reason: 'expired' };
    }

    return { valid: true, coupon };
  }

  /** @inheritdoc */
  async upsert(coupon: Coupon): Promise<Coupon> {
    const coupons = loadCouponsSnapshot();
    const normalized: Coupon = {
      ...coupon,
      code: coupon.code.trim().toUpperCase(),
    };
    const index = coupons.findIndex((item) => item.code === normalized.code);
    const next = [...coupons];
    if (index === -1) {
      next.unshift(normalized);
    } else {
      next[index] = normalized;
    }
    writeStorage(STORAGE_KEYS.coupons, next);
    return normalized;
  }

  /** @inheritdoc */
  async delete(code: string): Promise<void> {
    const coupons = loadCouponsSnapshot();
    const normalized = code.trim().toUpperCase();
    const next = coupons.filter((item) => item.code !== normalized);
    writeStorage(STORAGE_KEYS.coupons, next);
  }
}
