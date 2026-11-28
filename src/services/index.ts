/**
 * Service container exporting typed repository instances for forma/.
 * UI and Zustand stores import repositories from `@/services` instead of coupling
 * directly to concrete storage or Phase 2 Supabase/Prisma implementations.
 *
 * Phase 2 migration status:
 * - `authRepository` uses real Supabase Auth + PostgreSQL `public.users` (`Phase 2.2`).
 * - `productRepository`, `couponRepository`, and `orderRepository` migrate in `Phase 2.3–2.4`.
 *
 * Related: src/services/repositories/interfaces.ts
 */

import type {
  IAuthRepository,
  ICouponRepository,
  IOrderRepository,
  IProductRepository,
} from './repositories/interfaces';
import { MockCouponRepository } from './repositories/mock-coupon.repository';
import { MockOrderRepository } from './repositories/mock-order.repository';
import { MockProductRepository } from './repositories/mock-product.repository';
import { SupabaseAuthRepository } from './repositories/supabase-auth.repository';

export const productRepository: IProductRepository = new MockProductRepository();
export const authRepository: IAuthRepository = new SupabaseAuthRepository();
export const couponRepository: ICouponRepository = new MockCouponRepository();
export const orderRepository: IOrderRepository = new MockOrderRepository();

export type {
  CreateProductInput,
  IAuthRepository,
  ICouponRepository,
  IOrderRepository,
  IProductRepository,
  PlaceSimulatedOrderInput,
  SignInWithPasswordInput,
  SignUpResult,
  SignUpWithPasswordInput,
  UpdateProductInput,
} from './repositories/interfaces';
