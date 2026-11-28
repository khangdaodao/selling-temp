/**
 * Admin-only Signed ZIP Upload URL API (`POST /api/admin/storage/upload-url`).
 * Enforces `requireAdminUser()`, validates `.zip` extension and <= 50 MB size limits,
 * and issues a direct-to-bucket Supabase Private Storage upload token overwriting
 * the product's single latest object key (`products/<slug>/latest.zip`).
 *
 * Related: src/lib/storage/private-bucket.ts, src/features/admin/components/admin-view.tsx
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError, requireAdminUser } from '@/lib/auth/server-auth';
import {
  MAX_ZIP_BYTES,
  assertValidZipUploadMeta,
  createSignedProductZipUploadUrl,
} from '@/lib/storage/private-bucket';

const requestUploadSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Valid product slug required before uploading ZIP.'),
  fileName: z.string().trim().min(1),
  sizeBytes: z.number().int().positive().max(MAX_ZIP_BYTES),
});

/**
 * Generates a short-lived Private Storage upload token for verified Admins only.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdminUser();
    const rawBody: unknown = await request.json();
    const parsed = requestUploadSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid ZIP upload metadata.' },
        { status: 400 },
      );
    }

    assertValidZipUploadMeta(parsed.data.fileName, parsed.data.sizeBytes);
    const signedUpload = await createSignedProductZipUploadUrl(parsed.data.slug);

    return NextResponse.json(
      {
        ...signedUpload,
        maxBytes: MAX_ZIP_BYTES,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[POST /api/admin/storage/upload-url] Failed.', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to prepare private ZIP upload.',
      },
      { status: 500 },
    );
  }
}
