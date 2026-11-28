/**
 * Single Product API (`GET`, `PATCH`, `DELETE /api/products/[id]`) backed by PostgreSQL + Prisma.
 * - `GET`: Looks up by `id` or `slug`; hides `draft` items unless requested by verified Admin.
 * - `PATCH` / `DELETE`: Strictly guarded by `requireAdminUser()`. Cleans up product-specific
 *   private storage archives on delete while preserving shared sample fixtures.
 *
 * Related: src/lib/catalog/product-mapper.ts, src/lib/storage/private-bucket.ts
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import {
  AuthError,
  getServerAuthSession,
  requireAdminUser,
} from '@/lib/auth/server-auth';
import {
  mapDbProductToDomain,
  mapDomainPreviewModeToDb,
  updateProductBodySchema,
} from '@/lib/catalog/product-mapper';
import { prisma } from '@/lib/prisma';
import { PRIVATE_BUNDLE_BUCKET } from '@/lib/storage/private-bucket';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Fetches a single product by ID or slug without leaking private code file bodies.
 */
export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const row = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        codeFiles: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!row) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    if (row.status === 'draft') {
      const session = await getServerAuthSession();
      if (session?.user.role !== 'admin') {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }
    }

    return NextResponse.json(
      { product: mapDbProductToDomain(row, { includeCodeContent: false }) },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    console.error('[GET /api/products/[id]] Failed to load product.', error);
    return NextResponse.json(
      { error: 'Unable to load product.' },
      { status: 500 },
    );
  }
}

/**
 * Updates product fields, publication status, or ZIP metadata (Admin RBAC required).
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, tier: true, priceVnd: true, priceUsd: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const rawBody: unknown = await request.json();
    const parsed = updateProductBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid product update payload.' },
        { status: 400 },
      );
    }

    const patch = parsed.data;
    const effectiveTier = patch.tier ?? existing.tier;
    const data: Prisma.ProductUpdateInput = {
      ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
      ...(patch.tier !== undefined ? { tier: patch.tier } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.frameworks !== undefined ? { frameworks: patch.frameworks } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      ...(effectiveTier === 'free'
        ? { priceVnd: 0, priceUsd: 0 }
        : {
            ...(patch.priceVnd !== undefined ? { priceVnd: patch.priceVnd } : {}),
            ...(patch.priceUsd !== undefined ? { priceUsd: patch.priceUsd } : {}),
          }),
      ...(patch.shortDescription !== undefined
        ? {
            shortDescriptionVi: patch.shortDescription.vi,
            shortDescriptionEn: patch.shortDescription.en,
          }
        : {}),
      ...(patch.description !== undefined
        ? {
            descriptionVi: patch.description.vi,
            descriptionEn: patch.description.en,
          }
        : {}),
      ...(patch.documentation !== undefined
        ? {
            documentationVi: patch.documentation.vi,
            documentationEn: patch.documentation.en,
          }
        : {}),
      ...(patch.thumbnailVariant !== undefined
        ? { thumbnailVariant: patch.thumbnailVariant }
        : {}),
      ...(patch.thumbnailSubtitle !== undefined
        ? { thumbnailSubtitle: patch.thumbnailSubtitle }
        : {}),
      ...(patch.previewMode !== undefined
        ? { previewMode: mapDomainPreviewModeToDb(patch.previewMode) }
        : {}),
      ...(patch.previewComponentKey !== undefined
        ? { previewComponentKey: patch.previewComponentKey }
        : {}),
      ...(patch.supportsThemeToggle !== undefined
        ? { supportsThemeToggle: patch.supportsThemeToggle }
        : {}),
      ...(patch.featured !== undefined ? { featured: patch.featured } : {}),
      ...(patch.zipMetadata !== undefined
        ? {
            zipFileName: patch.zipMetadata.fileName,
            zipSizeBytes: patch.zipMetadata.sizeBytes,
            zipUpdatedAt: patch.zipMetadata.updatedAt
              ? new Date(patch.zipMetadata.updatedAt)
              : new Date(),
            ...(patch.zipMetadata.objectKey !== undefined
              ? { zipObjectKey: patch.zipMetadata.objectKey }
              : {}),
          }
        : {}),
    };

    const updated = await prisma.$transaction(async (tx) => {
      if (patch.codeBundle !== undefined) {
        await tx.productCodeFile.deleteMany({ where: { productId: id } });
        if (patch.codeBundle.length > 0) {
          await tx.productCodeFile.createMany({
            data: patch.codeBundle.map((file, index) => ({
              productId: id,
              path: file.path,
              language: file.language,
              content: file.content,
              sortOrder: index,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data,
        include: {
          codeFiles: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });

    return NextResponse.json(
      { product: mapDbProductToDomain(updated, { includeCodeContent: false }) },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A product with this slug already exists.' },
        { status: 409 },
      );
    }
    console.error('[PATCH /api/products/[id]] Failed to update product.', error);
    return NextResponse.json(
      { error: 'Unable to update product.' },
      { status: 500 },
    );
  }
}

/**
 * Deletes a catalog product (Admin RBAC required). Cleans up bespoke `.zip` objects from Storage.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, zipObjectKey: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    if (existing.zipObjectKey && existing.zipObjectKey.startsWith('products/')) {
      const admin = createSupabaseAdminClient();
      await admin.storage
        .from(PRIVATE_BUNDLE_BUCKET)
        .remove([existing.zipObjectKey]);
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return NextResponse.json(
        {
          error:
            'Product has historical orders attached. Switch status to Draft instead of deleting.',
        },
        { status: 409 },
      );
    }
    console.error('[DELETE /api/products/[id]] Failed to delete product.', error);
    return NextResponse.json(
      { error: 'Unable to delete product.' },
      { status: 500 },
    );
  }
}
