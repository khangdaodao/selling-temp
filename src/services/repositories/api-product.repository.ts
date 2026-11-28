/**
 * Production API-backed implementation of `IProductRepository` (`Phase 2.3`).
 * Routes catalog reads (`GET /api/products`, `GET /api/products/[id]`) and Admin mutations
 * (`POST`, `PATCH`, `DELETE`) through server Route Handlers connected to PostgreSQL + Prisma.
 *
 * Security boundary: Server enforces `requireAdminUser()` on drafts and all writes, and strips
 * protected `ProductCodeFile.content` from public catalog responses.
 *
 * Related: src/services/repositories/interfaces.ts, src/app/api/products/route.ts
 */

import { removeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import type { Product, ProductStatus } from '@/types/domain';
import type {
  CreateProductInput,
  IProductRepository,
  UpdateProductInput,
} from './interfaces';

interface ProductsListPayload {
  products?: Product[];
  error?: string;
}

interface SingleProductPayload {
  product?: Product | null;
  error?: string;
}

export class ApiProductRepository implements IProductRepository {
  /** @inheritdoc */
  async getAll(options?: { includeDrafts?: boolean }): Promise<Product[]> {
    removeStorage(STORAGE_KEYS.products);
    const includeDrafts = options?.includeDrafts ?? false;
    const url = includeDrafts
      ? '/api/products?includeDrafts=true'
      : '/api/products';

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });

    const payload = (await response.json()) as ProductsListPayload;
    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to load products.');
    }

    return payload.products ?? [];
  }

  /** @inheritdoc */
  async getBySlug(slug: string): Promise<Product | null> {
    const response = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });

    if (response.status === 404) {
      return null;
    }

    const payload = (await response.json()) as SingleProductPayload;
    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to load product details.');
    }

    return payload.product ?? null;
  }

  /** @inheritdoc */
  async getById(id: string): Promise<Product | null> {
    return this.getBySlug(id);
  }

  /** @inheritdoc */
  async create(input: CreateProductInput): Promise<Product> {
    const response = await fetch('/api/products', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as SingleProductPayload;
    if (!response.ok || !payload.product) {
      throw new Error(payload.error ?? 'Failed to create product.');
    }

    return payload.product;
  }

  /** @inheritdoc */
  async update(id: string, patch: UpdateProductInput): Promise<Product> {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });

    const payload = (await response.json()) as SingleProductPayload;
    if (!response.ok || !payload.product) {
      throw new Error(payload.error ?? 'Failed to update product.');
    }

    return payload.product;
  }

  /** @inheritdoc */
  async setStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.update(id, { status });
  }

  /** @inheritdoc */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to delete product.');
    }
  }
}
