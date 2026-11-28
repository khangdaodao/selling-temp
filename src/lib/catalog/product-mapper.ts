/**
 * Server-only Prisma <-> Domain mappers, Zod input validators, SSR catalog queries,
 * and server entitlement checks for forma/ Phase 2.3.
 *
 * Security boundary:
 * - Public queries filter strictly to `status = 'published'` and strip `ProductCodeFile.content`
 *   so locked source files never reach unauthenticated SSR HTML or public API responses.
 * - Real source code and private `.zip` downloads require `role === 'admin'` OR a persisted
 *   PostgreSQL `UserEntitlement` verified through `hasProductAccess()`.
 *
 * Related: prisma/schema.prisma, src/types/domain.ts, src/app/api/products/*
 */

import type {
  Coupon as PrismaCoupon,
  PreviewMode as PrismaPreviewMode,
  Product as PrismaProduct,
  ProductCodeFile as PrismaProductCodeFile,
} from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type {
  Coupon,
  CouponValidationResult,
  FrameworkType,
  PreviewMode,
  Product,
  ProductCategory,
  ProductCodeFile,
  UserRole,
} from '@/types/domain';

type PrismaProductWithCode = PrismaProduct & {
  codeFiles: PrismaProductCodeFile[];
};

const PREVIEW_MODE_FROM_DB: Record<PrismaPreviewMode, PreviewMode> = {
  interactive_card: 'interactive-card',
  thumbnail_modal: 'thumbnail-modal',
  template_fullscreen: 'template-fullscreen',
};

const PREVIEW_MODE_TO_DB: Record<PreviewMode, PrismaPreviewMode> = {
  'interactive-card': 'interactive_card',
  'thumbnail-modal': 'thumbnail_modal',
  'template-fullscreen': 'template_fullscreen',
};

const CODE_LANGUAGES = new Set<ProductCodeFile['language']>([
  'tsx',
  'ts',
  'css',
  'json',
  'md',
]);

function normalizeCodeLanguage(lang: string): ProductCodeFile['language'] {
  if (CODE_LANGUAGES.has(lang as ProductCodeFile['language'])) {
    return lang as ProductCodeFile['language'];
  }
  return 'tsx';
}

/**
 * Converts a domain `PreviewMode` string into its Prisma PostgreSQL enum value.
 */
export function mapDomainPreviewModeToDb(mode: PreviewMode): PrismaPreviewMode {
  return PREVIEW_MODE_TO_DB[mode];
}

/**
 * Maps a PostgreSQL `Product` record + ordered `ProductCodeFile[]` to the shared `Product` contract.
 * Strips raw file source contents unless `includeCodeContent` is explicitly authorized.
 */
export function mapDbProductToDomain(
  record: PrismaProductWithCode,
  options?: { includeCodeContent?: boolean },
): Product {
  const includeCodeContent = options?.includeCodeContent ?? false;
  const thumbnailVariant: Product['thumbnailVariant'] =
    record.thumbnailVariant === 'light' || record.thumbnailVariant === 'mixed'
      ? record.thumbnailVariant
      : 'dark';

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    type: record.type,
    tier: record.tier,
    status: record.status,
    category: record.category as ProductCategory,
    frameworks: record.frameworks as FrameworkType[],
    tags: record.tags,
    priceVnd: record.priceVnd,
    priceUsd: record.priceUsd,
    shortDescription: {
      vi: record.shortDescriptionVi,
      en: record.shortDescriptionEn,
    },
    description: {
      vi: record.descriptionVi,
      en: record.descriptionEn,
    },
    documentation: {
      vi: record.documentationVi,
      en: record.documentationEn,
    },
    thumbnailVariant,
    thumbnailSubtitle: record.thumbnailSubtitle,
    previewMode: PREVIEW_MODE_FROM_DB[record.previewMode],
    previewComponentKey: record.previewComponentKey,
    supportsThemeToggle: record.supportsThemeToggle,
    featured: record.featured,
    codeBundle: record.codeFiles.map((file) => ({
      path: file.path,
      language: normalizeCodeLanguage(file.language),
      content: includeCodeContent ? file.content : '',
    })),
    zipMetadata: {
      fileName: record.zipFileName,
      sizeBytes: record.zipSizeBytes,
      updatedAt: record.zipUpdatedAt.toISOString(),
      objectKey: record.zipObjectKey ?? null,
      sampleDownloadPath: record.zipObjectKey
        ? `/api/products/${encodeURIComponent(record.id)}/download`
        : null,
    },
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/**
 * Maps a PostgreSQL `Coupon` record to the shared `Coupon` contract.
 */
export function mapDbCouponToDomain(record: PrismaCoupon): Coupon {
  return {
    code: record.code,
    discountPercent: record.discountPercent,
    active: record.active,
    description: {
      vi: record.descriptionVi,
      en: record.descriptionEn,
    },
    expiresAt: record.expiresAt.toISOString(),
  };
}

/**
 * Validates a coupon code directly against PostgreSQL `public.coupons`
 * (checking existence, active toggle, expiration timestamp, and optional max redemption cap).
 */
export async function validateCouponInDb(
  rawCode: string,
): Promise<CouponValidationResult> {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, coupon: null, reason: 'empty' };
  }

  const record = await prisma.coupon.findUnique({
    where: { code: normalized },
  });

  if (!record) {
    return { valid: false, coupon: null, reason: 'not_found' };
  }

  const coupon = mapDbCouponToDomain(record);

  if (!record.active) {
    return { valid: false, coupon, reason: 'inactive' };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return { valid: false, coupon, reason: 'expired' };
  }

  if (record.maxUses !== null && record.usedCount >= record.maxUses) {
    return { valid: false, coupon, reason: 'inactive' };
  }

  return { valid: true, coupon };
}

/**
 * Authorizes source code / private `.zip` download access on the server:
 * grants access to Admin operators (`role === 'admin'`) or verified PostgreSQL
 * `UserEntitlement` holders (`userId + productId`). Never trusts browser storage.
 */
export async function hasProductAccess(
  userId: string,
  userRole: UserRole,
  productId: string,
): Promise<boolean> {
  if (userRole === 'admin') {
    return true;
  }

  const entitlement = await prisma.userEntitlement.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    select: { id: true },
  });

  return entitlement !== null;
}

/**
 * Server Component query returning up to `limit` published featured products for SSR Homepage.
 */
export async function getPublishedFeaturedProductsFromDb(
  limit = 6,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: 'published', featured: true },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      codeFiles: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return rows.map((row) => mapDbProductToDomain(row, { includeCodeContent: false }));
}

/**
 * Server Component query loading a single published product by URL slug for `/products/[slug]`
 * or `/preview/[slug]`. Returns `null` for unknown or draft products.
 */
export async function getPublishedProductBySlugFromDb(
  slug: string,
): Promise<Product | null> {
  const row = await prisma.product.findFirst({
    where: { slug, status: 'published' },
    include: {
      codeFiles: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return row ? mapDbProductToDomain(row, { includeCodeContent: false }) : null;
}

const localizedTextSchema = z.object({
  vi: z.string().trim().min(1).max(10000),
  en: z.string().trim().min(1).max(10000),
});

const codeFileSchema = z.object({
  path: z.string().trim().min(1).max(250),
  language: z.enum(['tsx', 'ts', 'css', 'json', 'md']),
  content: z.string().max(100000),
});

const zipMetadataInputSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().min(0).max(50 * 1024 * 1024),
  updatedAt: z.string().optional(),
  objectKey: z
    .string()
    .trim()
    .max(300)
    .refine(
      (val) => !val.includes('..') && !/^https?:\/\//i.test(val),
      'Invalid relative storage object key.',
    )
    .nullable()
    .optional(),
  sampleDownloadPath: z.string().nullable().optional(),
});

/** Zod validator for Admin `POST /api/products`. */
export const createProductBodySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens.'),
  name: z.string().trim().min(2).max(120),
  type: z.enum(['component', 'template']),
  tier: z.enum(['free', 'paid']),
  status: z.enum(['published', 'draft']),
  category: z.enum([
    'hero',
    'navbar',
    'pricing',
    'cards',
    'footer',
    'dashboard',
    'saas',
    'portfolio',
    'ecommerce',
  ]),
  frameworks: z.array(z.enum(['nextjs', 'react', 'tailwind'])).min(1),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  priceVnd: z.number().int().min(0),
  priceUsd: z.number().int().min(0),
  shortDescription: localizedTextSchema,
  description: localizedTextSchema,
  documentation: localizedTextSchema,
  thumbnailVariant: z.enum(['dark', 'light', 'mixed']),
  thumbnailSubtitle: z.string().trim().min(1).max(240),
  previewMode: z.enum(['interactive-card', 'thumbnail-modal', 'template-fullscreen']),
  previewComponentKey: z.string().trim().max(120).nullable(),
  supportsThemeToggle: z.boolean(),
  featured: z.boolean().default(false),
  codeBundle: z.array(codeFileSchema).max(30).default([]),
  zipMetadata: zipMetadataInputSchema,
});

/** Zod validator for Admin `PATCH /api/products/[id]`. */
export const updateProductBodySchema = createProductBodySchema.partial().extend({
  status: z.enum(['published', 'draft']).optional(),
});

/** Zod validator for Admin `POST /api/coupons`. */
export const upsertCouponBodySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{2,32}$/, 'Coupon code must be 2–32 alphanumeric characters.'),
  discountPercent: z.number().int().min(1).max(100),
  active: z.boolean(),
  expiresAt: z.string().datetime({ offset: true }).or(z.string().min(8)),
  description: localizedTextSchema,
});

/** Zod validator for `POST /api/coupons/validate`. */
export const validateCouponBodySchema = z.object({
  code: z.string().max(64),
});
