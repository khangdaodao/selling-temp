/**
 * Admin-only Coupons CRUD API (`GET`, `POST`, `DELETE /api/coupons`) backed by PostgreSQL + Prisma.
 * Strictly requires Server RBAC (`requireAdminUser()` -> `role === 'admin'`).
 *
 * Related: src/lib/catalog/product-mapper.ts, src/app/api/coupons/validate/route.ts
 */

import { NextResponse, type NextRequest } from 'next/server';
import { AuthError, requireAdminUser } from '@/lib/auth/server-auth';
import {
  mapDbCouponToDomain,
  upsertCouponBodySchema,
} from '@/lib/catalog/product-mapper';
import { prisma } from '@/lib/prisma';

/**
 * Lists all store promotional coupons for Admin management.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const rows = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { coupons: rows.map(mapDbCouponToDomain) },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[GET /api/coupons] Failed to query coupons.', error);
    return NextResponse.json(
      { error: 'Unable to load coupons.' },
      { status: 500 },
    );
  }
}

/**
 * Creates or updates a promotional coupon inside PostgreSQL (Admin RBAC required).
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const rawBody: unknown = await request.json();
    const parsed = upsertCouponBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid coupon payload.' },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const saved = await prisma.coupon.upsert({
      where: { code: input.code },
      update: {
        discountPercent: input.discountPercent,
        active: input.active,
        descriptionVi: input.description.vi,
        descriptionEn: input.description.en,
        expiresAt: new Date(input.expiresAt),
      },
      create: {
        code: input.code,
        discountPercent: input.discountPercent,
        active: input.active,
        descriptionVi: input.description.vi,
        descriptionEn: input.description.en,
        expiresAt: new Date(input.expiresAt),
      },
    });

    return NextResponse.json({ coupon: mapDbCouponToDomain(saved) }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[POST /api/coupons] Failed to save coupon.', error);
    return NextResponse.json(
      { error: 'Unable to save coupon.' },
      { status: 500 },
    );
  }
}

/**
 * Deletes a coupon by uppercase code via `?code=` (Admin RBAC required).
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const code = request.nextUrl.searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code query parameter is required.' }, { status: 400 });
    }

    await prisma.coupon.deleteMany({
      where: { code },
    });

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[DELETE /api/coupons] Failed to delete coupon.', error);
    return NextResponse.json(
      { error: 'Unable to delete coupon.' },
      { status: 500 },
    );
  }
}
