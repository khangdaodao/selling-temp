/**
 * Catalog Products API (`GET /api/products`, `POST /api/products`) backed by PostgreSQL + Prisma.
 * - `GET`: Returns `published` products by default with code file contents stripped; `?includeDrafts=true`
 *   requires Server RBAC (`requireAdminUser()`).
 * - `POST`: Creates a new product + code snippets strictly under `requireAdminUser()`.
 *
 * Related: src/lib/catalog/product-mapper.ts, src/lib/auth/server-auth.ts
 */

import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { AuthError, requireAdminUser } from '@/lib/auth/server-auth';
import {
  createProductBodySchema,
  mapDbProductToDomain,
  mapDomainPreviewModeToDb,
} from '@/lib/catalog/product-mapper';
import { SAMPLE_BUNDLE_OBJECT_KEY } from '@/lib/storage/private-bucket';
import { prisma } from '@/lib/prisma';

/**
 * Lists published catalog products (or all products including drafts for verified Admins).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const slug = searchParams.get('slug')?.trim();

    if (includeDrafts) {
      await requireAdminUser();
    }

    const whereClause: Prisma.ProductWhereInput = {};
    if (!includeDrafts) {
      whereClause.status = 'published';
    }
    if (slug) {
      whereClause.slug = slug;
    }

    const rows = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        codeFiles: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const products = rows.map((row) =>
      mapDbProductToDomain(row, { includeCodeContent: false }),
    );

    return NextResponse.json(
      { products },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[GET /api/products] Failed to query products.', error);
    return NextResponse.json(
      { error: 'Unable to load catalog products.' },
      { status: 500 },
    );
  }
}

/**
 * Creates a new catalog product + code preview entries in PostgreSQL (Admin RBAC required).
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const rawBody: unknown = await request.json();
    const parsed = createProductBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid product payload.' },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const safePriceVnd = input.tier === 'free' ? 0 : input.priceVnd;
    const safePriceUsd = input.tier === 'free' ? 0 : input.priceUsd;
    const id = `prd_${input.slug.slice(0, 24)}_${Date.now().toString(36)}`;
    const resolvedObjectKey =
      input.zipMetadata.objectKey ?? SAMPLE_BUNDLE_OBJECT_KEY;

    const created = await prisma.product.create({
      data: {
        id,
        slug: input.slug,
        name: input.name,
        type: input.type,
        tier: input.tier,
        status: input.status,
        category: input.category,
        frameworks: input.frameworks,
        tags: input.tags,
        priceVnd: safePriceVnd,
        priceUsd: safePriceUsd,
        shortDescriptionVi: input.shortDescription.vi,
        shortDescriptionEn: input.shortDescription.en,
        descriptionVi: input.description.vi,
        descriptionEn: input.description.en,
        documentationVi: input.documentation.vi,
        documentationEn: input.documentation.en,
        thumbnailVariant: input.thumbnailVariant,
        thumbnailSubtitle: input.thumbnailSubtitle,
        previewMode: mapDomainPreviewModeToDb(input.previewMode),
        previewComponentKey: input.previewComponentKey,
        supportsThemeToggle: input.supportsThemeToggle,
        featured: input.featured,
        zipObjectKey: resolvedObjectKey,
        zipFileName: input.zipMetadata.fileName,
        zipSizeBytes: input.zipMetadata.sizeBytes,
        zipUpdatedAt: input.zipMetadata.updatedAt
          ? new Date(input.zipMetadata.updatedAt)
          : new Date(),
        codeFiles: {
          create: input.codeBundle.map((file, index) => ({
            path: file.path,
            language: file.language,
            content: file.content,
            sortOrder: index,
          })),
        },
      },
      include: {
        codeFiles: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(
      { product: mapDbProductToDomain(created, { includeCodeContent: false }) },
      { status: 201 },
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
    console.error('[POST /api/products] Failed to create product.', error);
    return NextResponse.json(
      { error: 'Unable to create product.' },
      { status: 500 },
    );
  }
}
