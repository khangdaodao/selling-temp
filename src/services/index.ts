/**
 * Service container exporting typed repository instances for forma/.
 * UI and Zustand stores import repositories from `@/services` instead of coupling
 * directly to concrete storage or Phase 2 Supabase/Prisma implementations.
 *
 * Phase 2 migration status:
 * - `authRepository` uses Supabase Auth + PostgreSQL `public.users` (`Phase 2.2`).
 * - `productRepository` & `couponRepository` use PostgreSQL + Prisma APIs (`Phase 2.3`).
 * - `orderRepository` migrates to PayOS/Stripe + PostgreSQL in `Phase 2.4`.
 *
 * Related: src/services/repositories/interfaces.ts
 */

import { ApiCouponRepository } from './repositories/api-coupon.repository';
import { ApiProductRepository } from './repositories/api-product.repository';
import type {
  IAuthRepository,
  ICouponRepository,
  IOrderRepository,
  IProductRepository,
} from './repositories/interfaces';
import { MockOrderRepository } from './repositories/mock-order.repository';
import { SupabaseAuthRepository } from './repositories/supabase-auth.repository';

export const productRepository: IProductRepository = new ApiProductRepository();
export const authRepository: IAuthRepository = new SupabaseAuthRepository();
export const couponRepository: ICouponRepository = new ApiCouponRepository();
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
