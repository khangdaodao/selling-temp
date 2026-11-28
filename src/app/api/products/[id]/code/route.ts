/**
 * Server-authorized Source Code API (`GET /api/products/[id]/code`) for Monaco Viewer.
 * Returns `ProductCodeFile[]` contents from PostgreSQL ONLY after confirming the signed-in
 * user holds either `role === 'admin'` OR a persisted PostgreSQL `UserEntitlement`.
 *
 * Security boundary: Returns `401` for guests and `403` for non-entitled customers;
 * never trusts `localStorage` ownership arrays.
 *
 * Related: src/lib/catalog/product-mapper.ts, src/features/account/components/monaco-code-viewer.tsx
 */

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth/server-auth';
import {
  hasProductAccess,
  mapDbProductToDomain,
} from '@/lib/catalog/product-mapper';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Serves full source code files for an owned product or Admin preview.
 */
export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        codeFiles: {
          orderBy: { sortOrder: 'asc' },
        },
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
            'Purchase or entitlement required in PostgreSQL before inspecting full source code.',
        },
        { status: 403 },
      );
    }

    const mapped = mapDbProductToDomain(product, { includeCodeContent: true });

    return NextResponse.json(
      { files: mapped.codeBundle },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[GET /api/products/[id]/code] Failed to serve code bundle.', error);
    return NextResponse.json(
      { error: 'Unable to load source code bundle.' },
      { status: 500 },
    );
  }
}
