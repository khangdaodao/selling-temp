/**
 * Phase 1 localStorage-backed mock implementation of `IProductRepository`.
 * Hydrates initial catalog from `SEED_PRODUCTS` and persists Admin CRUD edits safely
 * through `StorageAdapter`.
 *
 * TODO(Phase 2): Replace with Prisma-backed server queries against MySQL.
 *
 * Related: src/services/repositories/interfaces.ts, src/mocks/products.seed.ts
 */

import { readStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import { SEED_PRODUCTS } from '@/mocks/products.seed';
import type { Product, ProductStatus } from '@/types/domain';
import type {
  CreateProductInput,
  IProductRepository,
  UpdateProductInput,
} from './interfaces';

function isProductArray(value: unknown): value is Product[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Product).id === 'string' &&
        typeof (item as Product).slug === 'string' &&
        typeof (item as Product).priceVnd === 'number' &&
        typeof (item as Product).priceUsd === 'number',
    )
  );
}

function loadProductsSnapshot(): Product[] {
  const stored = readStorage<Product[] | null>(
    STORAGE_KEYS.products,
    null,
    (val): val is Product[] | null => val === null || isProductArray(val),
  );
  if (stored === null || stored.length === 0) {
    return [...SEED_PRODUCTS];
  }
  return stored;
}

export class MockProductRepository implements IProductRepository {
  /** @inheritdoc */
  async getAll(options?: { includeDrafts?: boolean }): Promise<Product[]> {
    const items = loadProductsSnapshot();
    const includeDrafts = options?.includeDrafts ?? false;
    return includeDrafts
      ? items
      : items.filter((product) => product.status === 'published');
  }

  /** @inheritdoc */
  async getBySlug(slug: string): Promise<Product | null> {
    const items = loadProductsSnapshot();
    return items.find((product) => product.slug === slug) ?? null;
  }

  /** @inheritdoc */
  async getById(id: string): Promise<Product | null> {
    const items = loadProductsSnapshot();
    return items.find((product) => product.id === id) ?? null;
  }

  /** @inheritdoc */
  async create(input: CreateProductInput): Promise<Product> {
    const items = loadProductsSnapshot();
    const now = new Date().toISOString();
    const created: Product = {
      ...input,
      id: `prd_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const next = [created, ...items];
    writeStorage(STORAGE_KEYS.products, next);
    return created;
  }

  /** @inheritdoc */
  async update(id: string, patch: UpdateProductInput): Promise<Product> {
    const items = loadProductsSnapshot();
    const index = items.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new Error(`Product "${id}" was not found in mock repository.`);
    }
    const current = items[index];
    if (!current) {
      throw new Error(`Product "${id}" was not found in mock repository.`);
    }
    const updated: Product = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const next = [...items];
    next[index] = updated;
    writeStorage(STORAGE_KEYS.products, next);
    return updated;
  }

  /** @inheritdoc */
  async setStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.update(id, { status });
  }

  /** @inheritdoc */
  async delete(id: string): Promise<void> {
    const items = loadProductsSnapshot();
    const next = items.filter((product) => product.id !== id);
    writeStorage(STORAGE_KEYS.products, next);
  }
}
