/**
 * Server Coupon Validation API (`POST /api/coupons/validate`).
 * Verifies coupon code existence, active flag, expiry timestamp, and optional usage limit
 * directly against PostgreSQL `public.coupons` without leaking the full coupon list.
 *
 * Related: src/lib/catalog/product-mapper.ts, src/features/checkout/components/checkout-view.tsx
 */

import { NextResponse } from 'next/server';
import {
  validateCouponBodySchema,
  validateCouponInDb,
} from '@/lib/catalog/product-mapper';

/**
 * Validates a promotional coupon code against PostgreSQL.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await request.json();
    const parsed = validateCouponBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, coupon: null, reason: 'not_found' },
        { status: 400 },
      );
    }

    const result = await validateCouponInDb(parsed.data.code);

    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[POST /api/coupons/validate] Failed to validate coupon.', error);
    return NextResponse.json(
      { error: 'Unable to validate coupon.' },
      { status: 500 },
    );
  }
}
