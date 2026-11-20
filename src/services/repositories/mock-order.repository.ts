/**
 * Phase 1 localStorage-backed mock implementation of `IOrderRepository`.
 * Uses integer arithmetic exclusively for VND and USD subtotals, discounts, and totals.
 *
 * Security boundary: Unlocking products into `ownedProductIds` inside localStorage is
 * strictly for Phase 1 demo UX. Real product entitlement and source download access
 * MUST be enforced on the server in Phase 2.
 *
 * TODO(Phase 2): Replace with Prisma + MySQL orders and payment webhook verification.
 *
 * Related: src/services/repositories/interfaces.ts, src/lib/format/currency.ts
 */

import { calculateIntegerDiscount } from '@/lib/format/currency';
import { readStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import type { CurrencyCode, DemoUser, Order, OrderItem, Product } from '@/types/domain';
import type { IOrderRepository, PlaceSimulatedOrderInput } from './interfaces';
import { MockCouponRepository } from './mock-coupon.repository';

function isOrderArray(value: unknown): value is Order[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Order).id === 'string' &&
        Array.isArray((item as Order).items),
    )
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export class MockOrderRepository implements IOrderRepository {
  private readonly couponRepo = new MockCouponRepository();

  /** @inheritdoc */
  async getAllOrders(): Promise<Order[]> {
    return readStorage<Order[]>(STORAGE_KEYS.orders, [], isOrderArray);
  }

  /** @inheritdoc */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const all = await this.getAllOrders();
    return all.filter((order) => order.userId === userId);
  }

  /** @inheritdoc */
  async getOwnedProductIds(): Promise<string[]> {
    return readStorage<string[]>(STORAGE_KEYS.ownedProductIds, [], isStringArray);
  }

  /** @inheritdoc */
  async claimFreeProduct(
    user: DemoUser,
    product: Product,
    currencyUsed: CurrencyCode,
  ): Promise<Order> {
    if (product.tier !== 'free') {
      throw new Error('Only free products can be claimed without checkout.');
    }

    const order: Order = {
      id: `ord_free_${Date.now()}`,
      userId: user.id,
      customerEmail: user.email,
      items: [
        {
          productId: product.id,
          productName: product.name,
          productType: product.type,
          priceVnd: 0,
          priceUsd: 0,
        },
      ],
      couponCode: null,
      discountPercent: 0,
      subtotalVnd: 0,
      subtotalUsd: 0,
      totalVnd: 0,
      totalUsd: 0,
      currencyUsed,
      status: 'free_claimed',
      createdAt: new Date().toISOString(),
    };

    const existingOrders = await this.getAllOrders();
    writeStorage(STORAGE_KEYS.orders, [order, ...existingOrders]);

    const ownedIds = await this.getOwnedProductIds();
    if (!ownedIds.includes(product.id)) {
      writeStorage(STORAGE_KEYS.ownedProductIds, [...ownedIds, product.id]);
    }

    return order;
  }

  /** @inheritdoc */
  async placeSimulatedOrder(input: PlaceSimulatedOrderInput): Promise<Order> {
    const items: OrderItem[] = input.products.map((product) => ({
      productId: product.id,
      productName: product.name,
      productType: product.type,
      priceVnd: product.priceVnd,
      priceUsd: product.priceUsd,
    }));

    const subtotalVnd = items.reduce((sum, item) => sum + item.priceVnd, 0);
    const subtotalUsd = items.reduce((sum, item) => sum + item.priceUsd, 0);

    let appliedCouponCode: string | null = null;
    let discountPercent = 0;

    if (input.couponCode) {
      const validation = await this.couponRepo.validateCode(input.couponCode);
      if (validation.valid && validation.coupon) {
        appliedCouponCode = validation.coupon.code;
        discountPercent = validation.coupon.discountPercent;
      }
    }

    const discountVnd = calculateIntegerDiscount(subtotalVnd, discountPercent);
    const discountUsd = calculateIntegerDiscount(subtotalUsd, discountPercent);

    const order: Order = {
      id: `ord_${Date.now()}`,
      userId: input.user.id,
      customerEmail: input.user.email,
      items,
      couponCode: appliedCouponCode,
      discountPercent,
      subtotalVnd,
      subtotalUsd,
      totalVnd: Math.max(0, subtotalVnd - discountVnd),
      totalUsd: Math.max(0, subtotalUsd - discountUsd),
      currencyUsed: input.currencyUsed,
      status: input.outcome === 'success' ? 'paid' : 'failed',
      createdAt: new Date().toISOString(),
    };

    const existingOrders = await this.getAllOrders();
    writeStorage(STORAGE_KEYS.orders, [order, ...existingOrders]);

    if (input.outcome === 'success') {
      const ownedIds = await this.getOwnedProductIds();
      const merged = Array.from(
        new Set([...ownedIds, ...items.map((item) => item.productId)]),
      );
      writeStorage(STORAGE_KEYS.ownedProductIds, merged);
    }

    return order;
  }
}
