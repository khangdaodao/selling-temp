/**
 * Idempotent Prisma seed script populating Supabase PostgreSQL with the 18 initial
 * catalog products (including `ProductCodeFile` fixtures) and 3 promotional coupons.
 * Intentionally omits preset demo accounts — real users & Admin roles are provisioned
 * via Supabase Auth starting in Phase 2.2.
 *
 * Related: prisma/schema.prisma, src/mocks/products.seed.ts, src/mocks/coupons.seed.ts
 */

import {
  PreviewMode,
  PrismaClient,
  ProductCategory,
  ProductStatus,
  ProductTier,
  ProductType,
} from '@prisma/client';
import {
  SAMPLE_BUNDLE_OBJECT_KEY,
  syncSampleBundleToPrivateStorage,
} from '../src/lib/storage/private-bucket';
import { SEED_COUPONS } from '../src/mocks/coupons.seed';
import { SEED_PRODUCTS } from '../src/mocks/products.seed';
import type { PreviewMode as DomainPreviewMode } from '../src/types/domain';

const prisma = new PrismaClient();

function mapPreviewMode(mode: DomainPreviewMode): PreviewMode {
  switch (mode) {
    case 'interactive-card':
      return PreviewMode.interactive_card;
    case 'thumbnail-modal':
      return PreviewMode.thumbnail_modal;
    case 'template-fullscreen':
      return PreviewMode.template_fullscreen;
  }
}

/**
 * Upserts catalog products, code bundle files, and seed coupons into PostgreSQL.
 */
async function main(): Promise<void> {
  console.info(
    `Provisioning private bucket and seeding ${SEED_PRODUCTS.length} products and ${SEED_COUPONS.length} coupons...`,
  );

  await syncSampleBundleToPrivateStorage();

  for (const product of SEED_PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { id: product.id },
      select: { zipObjectKey: true },
    });
    const resolvedObjectKey =
      existing?.zipObjectKey ?? SAMPLE_BUNDLE_OBJECT_KEY;

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        type: product.type as ProductType,
        tier: product.tier as ProductTier,
        status: product.status as ProductStatus,
        category: product.category as ProductCategory,
        frameworks: product.frameworks,
        tags: product.tags,
        priceVnd: product.priceVnd,
        priceUsd: product.priceUsd,
        shortDescriptionVi: product.shortDescription.vi,
        shortDescriptionEn: product.shortDescription.en,
        descriptionVi: product.description.vi,
        descriptionEn: product.description.en,
        documentationVi: product.documentation.vi,
        documentationEn: product.documentation.en,
        thumbnailVariant: product.thumbnailVariant,
        thumbnailSubtitle: product.thumbnailSubtitle,
        previewMode: mapPreviewMode(product.previewMode),
        previewComponentKey: product.previewComponentKey,
        supportsThemeToggle: product.supportsThemeToggle,
        featured: product.featured,
        zipObjectKey: resolvedObjectKey,
        zipFileName: existing?.zipObjectKey ? undefined : product.zipMetadata.fileName,
        zipSizeBytes: existing?.zipObjectKey ? undefined : product.zipMetadata.sizeBytes,
        zipUpdatedAt: existing?.zipObjectKey ? undefined : new Date(product.zipMetadata.updatedAt),
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        type: product.type as ProductType,
        tier: product.tier as ProductTier,
        status: product.status as ProductStatus,
        category: product.category as ProductCategory,
        frameworks: product.frameworks,
        tags: product.tags,
        priceVnd: product.priceVnd,
        priceUsd: product.priceUsd,
        shortDescriptionVi: product.shortDescription.vi,
        shortDescriptionEn: product.shortDescription.en,
        descriptionVi: product.description.vi,
        descriptionEn: product.description.en,
        documentationVi: product.documentation.vi,
        documentationEn: product.documentation.en,
        thumbnailVariant: product.thumbnailVariant,
        thumbnailSubtitle: product.thumbnailSubtitle,
        previewMode: mapPreviewMode(product.previewMode),
        previewComponentKey: product.previewComponentKey,
        supportsThemeToggle: product.supportsThemeToggle,
        featured: product.featured,
        zipObjectKey: SAMPLE_BUNDLE_OBJECT_KEY,
        zipFileName: product.zipMetadata.fileName,
        zipSizeBytes: product.zipMetadata.sizeBytes,
        zipUpdatedAt: new Date(product.zipMetadata.updatedAt),
        createdAt: new Date(product.createdAt),
      },
    });

    await prisma.productCodeFile.deleteMany({
      where: { productId: product.id },
    });

    if (product.codeBundle.length > 0) {
      await prisma.productCodeFile.createMany({
        data: product.codeBundle.map((file, index) => ({
          productId: product.id,
          path: file.path,
          language: file.language,
          content: file.content,
          sortOrder: index,
        })),
      });
    }
  }

  for (const coupon of SEED_COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        discountPercent: coupon.discountPercent,
        active: coupon.active,
        descriptionVi: coupon.description.vi,
        descriptionEn: coupon.description.en,
        expiresAt: new Date(coupon.expiresAt),
      },
      create: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        active: coupon.active,
        descriptionVi: coupon.description.vi,
        descriptionEn: coupon.description.en,
        expiresAt: new Date(coupon.expiresAt),
      },
    });
  }

  const [productCount, fileCount, couponCount] = await Promise.all([
    prisma.product.count(),
    prisma.productCodeFile.count(),
    prisma.coupon.count(),
  ]);

  console.info(
    `Seed complete: ${productCount} products, ${fileCount} code files, ${couponCount} coupons.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed Supabase PostgreSQL:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
