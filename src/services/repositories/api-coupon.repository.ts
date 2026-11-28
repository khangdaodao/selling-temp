/**
 * Production API-backed implementation of `ICouponRepository` (`Phase 2.3`).
 * Routes coupon management (`GET`, `POST`, `DELETE /api/coupons`) under Admin Server RBAC
 * and validates codes at Checkout via `POST /api/coupons/validate` against PostgreSQL.
 *
 * Related: src/services/repositories/interfaces.ts, src/app/api/coupons/*
 */

import { removeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import type { Coupon, CouponValidationResult } from '@/types/domain';
import type { ICouponRepository } from './interfaces';

interface CouponsListPayload {
  coupons?: Coupon[];
  error?: string;
}

interface SingleCouponPayload {
  coupon?: Coupon;
  error?: string;
}

export class ApiCouponRepository implements ICouponRepository {
  /** @inheritdoc */
  async getAll(): Promise<Coupon[]> {
    removeStorage(STORAGE_KEYS.coupons);
    const response = await fetch('/api/coupons', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });

    const payload = (await response.json()) as CouponsListPayload;
    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to load coupons.');
    }

    return payload.coupons ?? [];
  }

  /** @inheritdoc */
  async validateCode(code: string): Promise<CouponValidationResult> {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      cache: 'no-store',
    });

    const payload = (await response.json()) as CouponValidationResult & {
      error?: string;
    };

    if (!response.ok) {
      return { valid: false, coupon: null, reason: 'not_found' };
    }

    return payload;
  }

  /** @inheritdoc */
  async upsert(coupon: Coupon): Promise<Coupon> {
    const response = await fetch('/api/coupons', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coupon),
    });

    const payload = (await response.json()) as SingleCouponPayload;
    if (!response.ok || !payload.coupon) {
      throw new Error(payload.error ?? 'Failed to save coupon.');
    }

    return payload.coupon;
  }

  /** @inheritdoc */
  async delete(code: string): Promise<void> {
    const response = await fetch(
      `/api/coupons?code=${encodeURIComponent(code.trim().toUpperCase())}`,
      {
        method: 'DELETE',
        credentials: 'same-origin',
      },
    );

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to delete coupon.');
    }
  }
}
