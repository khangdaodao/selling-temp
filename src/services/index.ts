/**
 * Service container exporting typed repository instances for forma/.
 * UI and Zustand stores import repositories from `@/services` instead of coupling
 * directly to concrete mock or Phase 2 database implementations.
 *
 * TODO(Phase 2): Bind interfaces to server-side MySQL + Prisma implementations.
 *
 * Related: src/services/repositories/interfaces.ts
 */

import type {
  IAuthRepository,
  ICouponRepository,
  IOrderRepository,
  IProductRepository,
} from './repositories/interfaces';
import { MockAuthRepository } from './repositories/mock-auth.repository';
import { MockCouponRepository } from './repositories/mock-coupon.repository';
import { MockOrderRepository } from './repositories/mock-order.repository';
import { MockProductRepository } from './repositories/mock-product.repository';

export const productRepository: IProductRepository = new MockProductRepository();
export const authRepository: IAuthRepository = new MockAuthRepository();
export const couponRepository: ICouponRepository = new MockCouponRepository();
export const orderRepository: IOrderRepository = new MockOrderRepository();

export type {
  CreateProductInput,
  IAuthRepository,
  ICouponRepository,
  IOrderRepository,
  IProductRepository,
  PlaceSimulatedOrderInput,
  UpdateProductInput,
} from './repositories/interfaces';
