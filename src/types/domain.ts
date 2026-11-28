/**
 * Cross-feature shared domain models and TypeScript contracts for forma/.
 * Defines entities for products, previews, authentication sessions, cart, coupons, and orders.
 *
 * Boundary note (Phase 1 vs Phase 2):
 * All pricing uses integer minor units (integer VND and integer USD) to prevent floating-point drift.
 * Client-side ownership and pricing fields are for Phase 1 demo UX only and MUST NOT be trusted
 * as sources of truth once Phase 2 backend APIs and MySQL + Prisma are introduced.
 *
 * Related: src/services/repositories/interfaces.ts, src/mocks/*.seed.ts, src/lib/format/currency.ts
 */

/** Supported UI locales for bilingual Vietnamese / English rendering. */
export type Locale = 'vi' | 'en';

/** Supported fixed display currencies in the Phase 1 demo catalog. */
export type CurrencyCode = 'VND' | 'USD';

/** Bilingual text container required for all user-facing catalog copy. */
export interface LocalizedText {
  vi: string;
  en: string;
}

/** Top-level product classification in the forma/ Library. */
export type ProductType = 'component' | 'template';

/** Pricing tier determining whether a product requires checkout or free claim. */
export type ProductTier = 'free' | 'paid';

/** Publication visibility state controlled by the Admin Dashboard. */
export type ProductStatus = 'published' | 'draft';

/** Primary frontend technology stack tag for filtering and display. */
export type FrameworkType = 'nextjs' | 'react' | 'tailwind';

/**
 * Smart Hybrid Preview strategy per product:
 * - `interactive-card`: Simple component rendered live directly inside the catalog card.
 * - `thumbnail-modal`: Complex section (navbar/hero/pricing) displaying thumbnail on card, opening live demo in preview modal/fullscreen.
 * - `template-fullscreen`: Full template displaying thumbnail on card, launching dedicated fullscreen viewport preview.
 */
export type PreviewMode =
  | 'interactive-card'
  | 'thumbnail-modal'
  | 'template-fullscreen';

/** Supported catalog categories for sidebar filtering in the Library view. */
export type ProductCategory =
  | 'hero'
  | 'navbar'
  | 'pricing'
  | 'cards'
  | 'footer'
  | 'dashboard'
  | 'saas'
  | 'portfolio'
  | 'ecommerce';

/** Virtual source file displayed inside the read-only Monaco code viewer after ownership. */
export interface ProductCodeFile {
  /** Workspace-relative file path (e.g., "components/hero.tsx"). */
  path: string;
  /** Language identifier used for Monaco syntax highlighting. */
  language: 'tsx' | 'ts' | 'css' | 'json' | 'md';
  /** Sample source code shown in Phase 1 demo mode (never contains paid production secrets). */
  content: string;
}

/**
 * Latest-only ZIP distribution metadata (per forma/ policy: no historical version archive).
 * In Phase 1, ZIP uploads in Admin store metadata only; downloads point to static demo assets.
 */
export interface ProductZipMetadata {
  fileName: string;
  sizeBytes: number;
  updatedAt: string;
  /** Static public path (e.g., "/demo-assets/sample-component.zip") or null when unavailable. */
  sampleDownloadPath: string | null;
}

/** Core catalog product entity representing a UI Component or Website Template. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  tier: ProductTier;
  status: ProductStatus;
  category: ProductCategory;
  frameworks: FrameworkType[];
  tags: string[];
  /** Fixed integer price in VND (e.g., 490000). Must be 0 when tier === 'free'. */
  priceVnd: number;
  /** Fixed integer price in USD (e.g., 19). Must be 0 when tier === 'free'. */
  priceUsd: number;
  shortDescription: LocalizedText;
  description: LocalizedText;
  documentation: LocalizedText;
  thumbnailVariant: 'dark' | 'light' | 'mixed';
  thumbnailSubtitle: string;
  previewMode: PreviewMode;
  /** Key mapping into the controlled React preview registry; null triggers explicit mock fallback UI. */
  previewComponentKey: string | null;
  supportsThemeToggle: boolean;
  featured: boolean;
  codeBundle: ProductCodeFile[];
  zipMetadata: ProductZipMetadata;
  createdAt: string;
  updatedAt: string;
}

/** Role within the Personal Store model (no third-party seller marketplace). */
export type UserRole = 'customer' | 'admin';

/**
 * Authenticated user profile entity for forma/.
 * In Phase 2, fields mirror `public.users` in PostgreSQL via Prisma ORM.
 * Security boundary: Never stores passwords, hashes, or OAuth secrets client-side.
 */
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  createdAt: string;
}

/** Semantic alias representing a verified user account record. */
export type AuthUser = DemoUser;

/** Active Supabase authentication session hydrated on client/server. */
export interface AuthSession {
  user: AuthUser;
  authProvider: 'email' | 'google';
  signedInAt: string;
}

/** Line item stored in the user's shopping cart (duplicates prevented by productId). */
export interface CartItem {
  productId: string;
  addedAt: string;
}

/** Computed cart totals using integer arithmetic in the active display currency. */
export interface CartSummary {
  itemCount: number;
  subtotalVnd: number;
  subtotalUsd: number;
  discountVnd: number;
  discountUsd: number;
  totalVnd: number;
  totalUsd: number;
}

/** Promotional discount coupon managed by Admin and validated at Checkout. */
export interface Coupon {
  code: string;
  /** Integer percentage between 1 and 100 (e.g., 20 means 20% off). */
  discountPercent: number;
  active: boolean;
  description: LocalizedText;
  expiresAt: string;
}

/** Result returned when validating a coupon code during checkout. */
export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon | null;
  reason?: 'empty' | 'not_found' | 'inactive' | 'expired';
}

/** Simulated checkout outcomes available for testing Phase 1 order flows. */
export type PaymentSimulationOutcome = 'success' | 'failure';

/** Order item snapshot captured at simulated checkout time. */
export interface OrderItem {
  productId: string;
  productName: string;
  productType: ProductType;
  priceVnd: number;
  priceUsd: number;
}

/** Simulated order record persisted to localStorage in Phase 1. */
export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  couponCode: string | null;
  discountPercent: number;
  subtotalVnd: number;
  subtotalUsd: number;
  totalVnd: number;
  totalUsd: number;
  currencyUsed: CurrencyCode;
  status: 'paid' | 'failed' | 'free_claimed';
  createdAt: string;
}
