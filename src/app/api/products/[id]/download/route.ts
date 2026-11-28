/**
 * Server-authorized Private ZIP Download API (`GET /api/products/[id]/download`).
 * Verifies Supabase session + PostgreSQL access (`role === 'admin'` or `UserEntitlement`),
 * generates a 60-second Supabase Private Storage Signed URL with attachment filename,
 * and either redirects (`302`) directly to the download or returns JSON (`?format=json`).
 *
 * Security boundary: Never exposes static bucket URLs publicly and rejects unentitled users (`401`/`403`).
 *
 * Related: src/lib/storage/private-bucket.ts, src/lib/catalog/product-mapper.ts
 */

import { NextResponse, type NextRequest } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth/server-auth';
import { hasProductAccess } from '@/lib/catalog/product-mapper';
import { prisma } from '@/lib/prisma';
import {
  SIGNED_DOWNLOAD_TTL_SECONDS,
  createSignedProductZipDownloadUrl,
} from '@/lib/storage/private-bucket';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Mints a short-lived (60s) Signed Download URL for a product `.zip` archive.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const responseFormat = request.nextUrl.searchParams.get('format');

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        zipObjectKey: true,
        zipFileName: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    if (product.status === 'draft' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const allowed = await hasProductAccess(user.id, user.role, product.id);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            'Purchase or entitlement required in PostgreSQL before downloading this ZIP archive.',
        },
        { status: 403 },
      );
    }

    if (!product.zipObjectKey) {
      return NextResponse.json(
        { error: 'No ZIP bundle has been uploaded for this product yet.' },
        { status: 404 },
      );
    }

    const signedUrl = await createSignedProductZipDownloadUrl(
      product.zipObjectKey,
      product.zipFileName,
    );

    if (responseFormat === 'json') {
      return NextResponse.json(
        {
          url: signedUrl,
          fileName: product.zipFileName,
          expiresInSeconds: SIGNED_DOWNLOAD_TTL_SECONDS,
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[GET /api/products/[id]/download] Signed URL failure.', error);
    return NextResponse.json(
      { error: 'Unable to generate download link.' },
      { status: 500 },
    );
  }
}
