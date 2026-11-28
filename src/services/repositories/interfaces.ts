/**
 * Repository interface contracts decoupling UI/state features from persistence mechanisms.
 * Phase 1 resolves these contracts with localStorage-backed mock repositories;
 * Phase 2 swaps in Next.js server actions / route handlers backed by MySQL + Prisma
 * with minimal changes to UI components.
 *
 * Related: src/types/domain.ts, src/services/repositories/mock-*.repository.ts
 */

import type {
  AuthSession,
  Coupon,
  CouponValidationResult,
  CurrencyCode,
  DemoUser,
  Order,
  PaymentSimulationOutcome,
  Product,
  ProductStatus,
} from '@/types/domain';

/** Input payload for creating a product inside the Admin Dashboard. */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/** Partial update payload for editing an existing product in the Admin Dashboard. */
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt'>>;

/**
 * Catalog product repository contract.
 * TODO(Phase 2): Implement PrismaProductRepository backed by MySQL `Product` table
 * and ensure admin mutations require server-verified Admin role authorization.
 */
export interface IProductRepository {
  /** Retrieves all published products (or all including drafts when `includeDrafts` is true). */
  getAll(options?: { includeDrafts?: boolean }): Promise<Product[]>;
  /** Retrieves a single product by URL slug, or `null` when not found. */
  getBySlug(slug: string): Promise<Product | null>;
  /** Retrieves a single product by ID, or `null` when not found. */
  getById(id: string): Promise<Product | null>;
  /** Creates a new product entry (persisted to localStorage in Phase 1 mock mode). */
  create(input: CreateProductInput): Promise<Product>;
  /** Updates an existing product by ID and returns the updated record. */
  update(id: string, patch: UpdateProductInput): Promise<Product>;
  /** Toggles publication status (`published` / `draft`). */
  setStatus(id: string, status: ProductStatus): Promise<Product>;
  /** Deletes a product by ID. */
  delete(id: string): Promise<void>;
}

/** Credentials payload for Supabase Email + Password login. */
export interface SignInWithPasswordInput {
  email: string;
  password: string;
}

/** Registration payload for Supabase Email + Password sign-up. */
export interface SignUpWithPasswordInput {
  name: string;
  email: string;
  password: string;
  emailRedirectTo?: string;
}

/** Result returned from Email + Password registration. */
export interface SignUpResult {
  session: AuthSession | null;
  requiresEmailConfirmation: boolean;
}

/**
 * Authentication and profile repository contract backed by Supabase Auth + PostgreSQL `public.users`.
 * Security boundary: Never stores passwords locally or trusts client role mutations.
 */
export interface IAuthRepository {
  /** Fetches the server-verified session from `/api/auth/session`, or `null` when signed out. */
  getSession(): Promise<AuthSession | null>;
  /** Authenticates via Email + Password using Supabase Auth and resolves PostgreSQL profile. */
  signInWithPassword(input: SignInWithPasswordInput): Promise<AuthSession>;
  /** Creates a new customer account via Supabase Auth. */
  signUpWithPassword(input: SignUpWithPasswordInput): Promise<SignUpResult>;
  /** Sends a password recovery link via Supabase Auth. */
  sendPasswordResetEmail(input: { email: string; redirectTo: string }): Promise<void>;
  /** Updates password for an active or recovery Supabase Auth session. */
  updatePassword(newPassword: string): Promise<void>;
  /** Launches Google OAuth redirect flow through Supabase Auth. */
  signInWithGoogle(redirectTo: string): Promise<void>;
  /** Updates display name inside PostgreSQL `public.users` via server API. */
  updateProfile(input: { name: string }): Promise<AuthSession>;
  /** Signs out of Supabase Auth and clears server cookies. */
  signOut(): Promise<void>;
}

/**
 * Coupon validation and admin coupon management contract.
 * TODO(Phase 2): Validate coupon eligibility, usage limits, and expiry strictly server-side.
 */
export interface ICouponRepository {
  /** Lists all configured coupons (Admin view). */
  getAll(): Promise<Coupon[]>;
  /** Validates a promotional code and returns eligibility details. */
  validateCode(code: string): Promise<CouponValidationResult>;
  /** Saves or updates a coupon inside Phase 1 localStorage. */
  upsert(coupon: Coupon): Promise<Coupon>;
  /** Deletes a coupon by code. */
  delete(code: string): Promise<void>;
}

/** Input parameters to place a simulated Phase 1 order. */
export interface PlaceSimulatedOrderInput {
  user: DemoUser;
  products: Product[];
  couponCode: string | null;
  currencyUsed: CurrencyCode;
  outcome: PaymentSimulationOutcome;
}

/**
 * Order history and product ownership repository contract.
 * Security boundary: Phase 1 stores ownership in browser localStorage; never trust client ownership
 * in Phase 2 production downloads.
 * TODO(Phase 2): Enforce server-side order verification and signed private download URLs in MySQL + S3/R2.
 */
export interface IOrderRepository {
  /** Returns all recorded orders (Admin overview). */
  getAllOrders(): Promise<Order[]>;
  /** Returns orders belonging to a specific demo user ID. */
  getOrdersByUser(userId: string): Promise<Order[]>;
  /** Returns the set of product IDs unlocked for the current demo session. */
  getOwnedProductIds(): Promise<string[]>;
  /** Claims a `tier === 'free'` product for a signed-in demo user. */
  claimFreeProduct(user: DemoUser, product: Product, currencyUsed: CurrencyCode): Promise<Order>;
  /** Simulates paid checkout (`success` unlocks items in My Library; `failure` logs failed attempt). */
  placeSimulatedOrder(input: PlaceSimulatedOrderInput): Promise<Order>;
}
