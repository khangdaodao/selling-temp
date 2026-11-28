/**
 * Server-only Supabase Private Storage manager for forma/ Phase 2.3.
 * Stores all product `.zip` archives inside a private bucket (`product-bundles`) using
 * vendor-neutral relative object keys (`zipObjectKey`) and issues short-lived Signed URLs
 * only after Server RBAC (`requireAdminUser`) or `UserEntitlement` authorization succeeds.
 *
 * Security boundary:
 * - Bucket is strictly `public: false` (never publicly readable).
 * - Never import or invoke this module in `'use client'` modules.
 * - Never hardcode full Supabase Storage URLs in PostgreSQL; store relative keys only.
 *
 * Related: src/lib/supabase/admin.ts, src/app/api/admin/storage/upload-url/route.ts,
 * src/app/api/products/[id]/download/route.ts
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

/** Name of the Supabase Private Bucket storing latest product `.zip` bundles. */
export const PRIVATE_BUNDLE_BUCKET = 'product-bundles' as const;

/** Maximum allowed `.zip` upload size (50 MB — aligned with Supabase Free object limits). */
export const MAX_ZIP_BYTES = 50 * 1024 * 1024;

/** Signed download link lifetime in seconds (per ADR-008: ~60 seconds). */
export const SIGNED_DOWNLOAD_TTL_SECONDS = 60;

/** Default relative key for the sample demo bundle shared by seeded catalog items. */
export const SAMPLE_BUNDLE_OBJECT_KEY = 'samples/forma-sample-bundle.zip' as const;

const SLUG_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ALLOWED_ZIP_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
];

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('private-bucket helpers must only run on the server.');
  }
}

/**
 * Computes the canonical latest-only relative object key (`products/<slug>/latest.zip`)
 * for a catalog product inside the private storage bucket.
 */
export function buildProductZipObjectKey(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (!SLUG_KEY_PATTERN.test(normalized)) {
    throw new Error('Invalid product slug for Private Storage key.');
  }
  return `products/${normalized}/latest.zip`;
}

/**
 * Validates that a candidate `.zip` file upload has a `.zip` extension and stays within 50 MB.
 */
export function assertValidZipUploadMeta(fileName: string, sizeBytes: number): void {
  const cleanName = fileName.trim().toLowerCase();
  if (!cleanName.endsWith('.zip')) {
    throw new Error('Only .zip archive files are permitted.');
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new Error('ZIP file must not be empty.');
  }
  if (sizeBytes > MAX_ZIP_BYTES) {
    throw new Error('ZIP archive exceeds the 50 MB maximum size limit.');
  }
}

/**
 * Validates that a stored `zipObjectKey` is a safe relative path (blocks traversal or URLs).
 */
export function assertSafeRelativeObjectKey(objectKey: string): string {
  const trimmed = objectKey.trim().replace(/^\/+/, '');
  if (
    !trimmed ||
    trimmed.includes('..') ||
    trimmed.includes('\\') ||
    /^https?:\/\//i.test(trimmed)
  ) {
    throw new Error('Unsafe storage object key.');
  }
  return trimmed;
}

/**
 * Ensures the `product-bundles` Private Bucket exists in Supabase Storage with strict
 * MIME-type and 50 MB file size constraints.
 */
export async function ensurePrivateBundleBucket(): Promise<void> {
  assertServerOnly();
  const admin = createSupabaseAdminClient();
  const { data: existing, error: getError } = await admin.storage.getBucket(
    PRIVATE_BUNDLE_BUCKET,
  );

  if (!getError && existing) {
    if (existing.public) {
      await admin.storage.updateBucket(PRIVATE_BUNDLE_BUCKET, {
        public: false,
        fileSizeLimit: MAX_ZIP_BYTES,
        allowedMimeTypes: ALLOWED_ZIP_MIME_TYPES,
      });
    }
    return;
  }

  const { error: createError } = await admin.storage.createBucket(
    PRIVATE_BUNDLE_BUCKET,
    {
      public: false,
      fileSizeLimit: MAX_ZIP_BYTES,
      allowedMimeTypes: ALLOWED_ZIP_MIME_TYPES,
    },
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(`Unable to initialize private storage bucket: ${createError.message}`);
  }
}

/**
 * Uploads `public/demo-assets/forma-sample-bundle.zip` into Private Storage at
 * `samples/forma-sample-bundle.zip` so seeded catalog items resolve through real Signed URLs.
 */
export async function syncSampleBundleToPrivateStorage(): Promise<void> {
  assertServerOnly();
  await ensurePrivateBundleBucket();
  const admin = createSupabaseAdminClient();
  const localZipPath = path.join(
    process.cwd(),
    'public',
    'demo-assets',
    'forma-sample-bundle.zip',
  );
  const buffer = await readFile(localZipPath);

  const { error } = await admin.storage
    .from(PRIVATE_BUNDLE_BUCKET)
    .upload(SAMPLE_BUNDLE_OBJECT_KEY, buffer, {
      contentType: 'application/zip',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload sample ZIP bundle: ${error.message}`);
  }
}

/**
 * Issues a short-lived Signed Upload URL for Admin direct-to-bucket `.zip` upload
 * (overwriting the single `latest.zip` object in accordance with Lifetime Updates policy).
 */
export async function createSignedProductZipUploadUrl(slug: string): Promise<{
  bucket: string;
  objectKey: string;
  token: string;
  signedUrl: string;
}> {
  assertServerOnly();
  await ensurePrivateBundleBucket();
  const objectKey = buildProductZipObjectKey(slug);
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.storage
    .from(PRIVATE_BUNDLE_BUCKET)
    .createSignedUploadUrl(objectKey, { upsert: true });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to issue signed upload URL.');
  }

  return {
    bucket: PRIVATE_BUNDLE_BUCKET,
    objectKey: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}

/**
 * Generates a 60-second Signed Download URL with attachment disposition for an authorized
 * user (`role === 'admin'` or Postgres `UserEntitlement` holder).
 */
export async function createSignedProductZipDownloadUrl(
  rawObjectKey: string,
  downloadFileName: string,
): Promise<string> {
  assertServerOnly();
  const objectKey = assertSafeRelativeObjectKey(rawObjectKey);
  const cleanFileName =
    downloadFileName.trim().replace(/[^a-zA-Z0-9._-]/g, '-') || 'forma-bundle.zip';
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.storage
    .from(PRIVATE_BUNDLE_BUCKET)
    .createSignedUrl(objectKey, SIGNED_DOWNLOAD_TTL_SECONDS, {
      download: cleanFileName,
    });

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Failed to create signed download URL.');
  }

  return data.signedUrl;
}
