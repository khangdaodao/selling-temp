/**
 * Admin Dashboard (`/admin`) workspace for forma/ Phase 2.3.
 * Protected by Server RBAC (`src/app/admin/page.tsx`) and connected to PostgreSQL + Prisma
 * APIs for Products CRUD, Draft/Published toggles, real Supabase Private Storage `.zip` uploads,
 * Registered Customers (`GET /api/admin/customers`), and Coupons CRUD (`GET/POST/DELETE /api/coupons`).
 * Note: Orders, simulated revenue, and Analytics remain backed by Phase 1 stubs until Phase 2.4–2.5.
 *
 * Related: src/app/admin/page.tsx, src/services/repositories/api-product.repository.ts,
 * src/services/repositories/api-coupon.repository.ts
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileArchive,
  LayoutDashboard,
  Lock,
  Package,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  Tag,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { pickLocalizedText, useI18n } from '@/i18n/use-i18n-store';
import { formatMoneyAmount, formatProductPrice } from '@/lib/format/currency';
import { resetAllDemoData } from '@/lib/storage/storage-adapter';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  couponRepository,
  orderRepository,
  productRepository,
  type CreateProductInput,
} from '@/services';
import type {
  AuthUser,
  Coupon,
  FrameworkType,
  Order,
  PreviewMode,
  Product,
  ProductCategory,
  ProductCodeFile,
  ProductStatus,
  ProductTier,
  ProductType,
  ProductZipMetadata,
} from '@/types/domain';

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'analytics'
  | 'settings';

const ADMIN_TABS: readonly AdminTab[] = [
  'overview',
  'products',
  'orders',
  'customers',
  'coupons',
  'analytics',
  'settings',
];

const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'hero',
  'navbar',
  'pricing',
  'cards',
  'footer',
  'dashboard',
  'saas',
  'portfolio',
  'ecommerce',
];

const ALL_FRAMEWORKS: readonly FrameworkType[] = ['nextjs', 'react', 'tailwind'];

const SAFE_PREVIEW_KEYS: readonly string[] = [
  'component-signal-button',
  'component-prism-toggle',
  'component-kinetic-card',
  'component-voices-cards',
  'component-halo-hero',
  'component-pulse-hero',
  'component-nexus-grid',
  'component-priceless-table',
  'component-monolith-hero',
  'component-vector-nav',
  'component-baseline-footer',
  'template-orbit',
  'template-northbound',
  'template-metric',
  'template-atelier',
  'template-monofolio',
  'template-kestreldocs',
];

const MOCK_MONTHLY_REVENUE = [
  { month: 'May', usd: 1420 },
  { month: 'Jun', usd: 1890 },
  { month: 'Jul', usd: 2340 },
  { month: 'Aug', usd: 2110 },
  { month: 'Sep', usd: 2980 },
  { month: 'Oct', usd: 3640 },
] as const;

interface ProductFormState {
  name: string;
  slug: string;
  type: ProductType;
  tier: ProductTier;
  status: ProductStatus;
  category: ProductCategory;
  frameworks: FrameworkType[];
  priceVnd: number;
  priceUsd: number;
  thumbnailVariant: 'dark' | 'light' | 'mixed';
  thumbnailSubtitle: string;
  previewMode: PreviewMode;
  previewComponentKey: string;
  supportsThemeToggle: boolean;
  shortDescVi: string;
  shortDescEn: string;
  descVi: string;
  descEn: string;
  docsVi: string;
  docsEn: string;
  zipMetadata: ProductZipMetadata;
}

interface CouponFormState {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAtDate: string;
  descVi: string;
  descEn: string;
}

function slugifyProductName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function createEmptyProductForm(): ProductFormState {
  return {
    name: '',
    slug: '',
    type: 'component',
    tier: 'paid',
    status: 'published',
    category: 'cards',
    frameworks: ['nextjs', 'react', 'tailwind'],
    priceVnd: 290000,
    priceUsd: 12,
    thumbnailVariant: 'dark',
    thumbnailSubtitle: 'Minimal modular surface ready for production.',
    previewMode: 'interactive-card',
    previewComponentKey: '',
    supportsThemeToggle: true,
    shortDescVi: '',
    shortDescEn: '',
    descVi: '',
    descEn: '',
    docsVi: 'Cài đặt vào Next.js 15 App Router cùng Tailwind CSS tokens.',
    docsEn: 'Drop directly into Next.js 15 App Router with standard Tailwind tokens.',
    zipMetadata: {
      fileName: 'forma-sample-bundle.zip',
      sizeBytes: 647,
      updatedAt: new Date().toISOString(),
      sampleDownloadPath: '/demo-assets/forma-sample-bundle.zip',
    },
  };
}

function productToFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    type: product.type,
    tier: product.tier,
    status: product.status,
    category: product.category,
    frameworks: [...product.frameworks],
    priceVnd: product.priceVnd,
    priceUsd: product.priceUsd,
    thumbnailVariant: product.thumbnailVariant,
    thumbnailSubtitle: product.thumbnailSubtitle,
    previewMode: product.previewMode,
    previewComponentKey: product.previewComponentKey ?? '',
    supportsThemeToggle: product.supportsThemeToggle,
    shortDescVi: product.shortDescription.vi,
    shortDescEn: product.shortDescription.en,
    descVi: product.description.vi,
    descEn: product.description.en,
    docsVi: product.documentation.vi,
    docsEn: product.documentation.en,
    zipMetadata: { ...product.zipMetadata },
  };
}

function createEmptyCouponForm(): CouponFormState {
  return {
    code: '',
    discountPercent: 15,
    active: true,
    expiresAtDate: '2027-12-31',
    descVi: '',
    descEn: '',
  };
}

function buildSanitizedCodeBundle(slug: string, name: string): ProductCodeFile[] {
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '') || 'FormaModule';
  return [
    {
      path: `components/${slug}.tsx`,
      language: 'tsx',
      content: `/**\n * Sanitized Phase 1 demo source fixture for ${name}.\n */\nimport React from 'react';\n\nexport function ${safeName}() {\n  return (\n    <div className="rounded-xl border border-white/10 bg-[#0c0c0f] p-6 text-white">\n      <h3 className="text-base font-semibold">${name}</h3>\n      <p className="mt-1 text-sm text-zinc-400">Created in forma/ Admin Demo.</p>\n    </div>\n  );\n}\n`,
    },
    {
      path: 'README.md',
      language: 'md',
      content: `# ${name}\n\nPhase 1 sanitized demo fixture created inside the Admin Dashboard.\n`,
    },
  ];
}

/**
 * Interactive 7-tab Admin Dashboard gated by Phase 1 Mock Admin Role.
 */
export function AdminView(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { t, locale, currency } = useI18n();
  const session = useAuthStore((state) => state.session);
  const hydrated = useAuthStore((state) => state.hydrated);
  const ownedProductIds = useAuthStore((state) => state.ownedProductIds);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  const tabParam = searchParams.get('tab');
  const initialTab: AdminTab = ADMIN_TABS.includes(tabParam as AdminTab)
    ? (tabParam as AdminTab)
    : 'overview';

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Products CRUD state
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(() =>
    createEmptyProductForm(),
  );
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingZipFile, setPendingZipFile] = useState<File | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  // Coupons CRUD state
  const [couponForm, setCouponForm] = useState<CouponFormState>(() =>
    createEmptyCouponForm(),
  );
  const [couponError, setCouponError] = useState<string | null>(null);

  // Reset confirmation state
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    if (tabParam && ADMIN_TABS.includes(tabParam as AdminTab)) {
      setActiveTab(tabParam as AdminTab);
    }
  }, [tabParam]);

  const loadAdminSnapshots = useCallback(async (): Promise<void> => {
    setLoadingData(true);
    const [allProducts, allCoupons, allOrders, usersResponse] = await Promise.all([
      productRepository.getAll({ includeDrafts: true }),
      couponRepository.getAll(),
      orderRepository.getAllOrders(),
      fetch('/api/admin/customers', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      }).catch(() => null),
    ]);
    setProducts(allProducts);
    setCoupons(allCoupons);
    setOrders(allOrders);

    if (usersResponse && usersResponse.ok) {
      const payload = (await usersResponse.json()) as { users?: AuthUser[] };
      setRegisteredUsers(payload.users ?? []);
    } else {
      setRegisteredUsers([]);
    }

    setLoadingData(false);
  }, []);

  useEffect(() => {
    void loadAdminSnapshots();
    const handleReset = (): void => {
      setShowProductForm(false);
      setEditingProductId(null);
      setConfirmDeleteId(null);
      setConfirmResetOpen(false);
      void loadAdminSnapshots();
    };
    window.addEventListener(DEMO_RESET_EVENT, handleReset);
    return () => {
      window.removeEventListener(DEMO_RESET_EVENT, handleReset);
    };
  }, [loadAdminSnapshots]);

  const showToast = (msg: string): void => {
    setBannerMessage(msg);
    window.setTimeout(() => {
      setBannerMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Aggregate KPI metrics
  const metrics = useMemo(() => {
    const publishedCount = products.filter((p) => p.status === 'published').length;
    const draftCount = products.length - publishedCount;
    const paidOrders = orders.filter((o) => o.status === 'paid');
    const revenueVnd = paidOrders.reduce((acc, o) => acc + o.totalVnd, 0);
    const revenueUsd = paidOrders.reduce((acc, o) => acc + o.totalUsd, 0);
    const activeCouponsCount = coupons.filter((c) => c.active).length;

    return {
      totalProducts: products.length,
      publishedCount,
      draftCount,
      totalOrders: orders.length,
      revenueVnd,
      revenueUsd,
      activeCouponsCount,
    };
  }, [products, orders, coupons]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter !== 'all' && product.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  }, [products, productSearch, statusFilter]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<ProductCategory, number>();
    for (const cat of PRODUCT_CATEGORIES) {
      counts.set(cat, 0);
    }
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    const maxCount = Math.max(1, ...Array.from(counts.values()));
    return PRODUCT_CATEGORIES.map((category) => {
      const count = counts.get(category) ?? 0;
      return {
        category,
        count,
        percent: Math.round((count / maxCount) * 100),
      };
    });
  }, [products]);

  const customerRows = useMemo(() => {
    const orderCounts = new Map<string, number>();
    for (const order of orders) {
      const key = order.customerEmail.toLowerCase();
      orderCounts.set(key, (orderCounts.get(key) ?? 0) + 1);
    }

    const combined: Array<{
      id: string;
      name: string;
      email: string;
      role: AuthUser['role'];
      isSyncedUser: boolean;
      orderCount: number;
    }> = registeredUsers.map((acc) => ({
      id: acc.id,
      name: acc.name,
      email: acc.email,
      role: acc.role,
      isSyncedUser: true,
      orderCount: orderCounts.get(acc.email.toLowerCase()) ?? 0,
    }));

    for (const order of orders) {
      const lower = order.customerEmail.toLowerCase();
      if (!combined.some((entry) => entry.email.toLowerCase() === lower)) {
        combined.push({
          id: order.userId,
          name: order.customerEmail.split('@')[0] || 'Customer',
          email: order.customerEmail,
          role: 'customer',
          isSyncedUser: false,
          orderCount: orderCounts.get(lower) ?? 0,
        });
      }
    }

    return combined;
  }, [orders, registeredUsers]);

  // Handlers for Product Form
  const handleOpenCreateProduct = (): void => {
    setEditingProductId(null);
    setSlugTouched(false);
    setProductFormError(null);
    setPendingZipFile(null);
    setProductForm(createEmptyProductForm());
    setShowProductForm(true);
    setActiveTab('products');
  };

  const handleOpenEditProduct = (product: Product): void => {
    setEditingProductId(product.id);
    setSlugTouched(true);
    setProductFormError(null);
    setPendingZipFile(null);
    setProductForm(productToFormState(product));
    setShowProductForm(true);
  };

  const handleProductNameChange = (name: string): void => {
    setProductForm((prev) => ({
      ...prev,
      name,
      slug: !slugTouched && editingProductId === null ? slugifyProductName(name) : prev.slug,
    }));
  };

  const handleToggleFramework = (fw: FrameworkType): void => {
    setProductForm((prev) => {
      const exists = prev.frameworks.includes(fw);
      const next = exists
        ? prev.frameworks.filter((item) => item !== fw)
        : [...prev.frameworks, fw];
      return { ...prev, frameworks: next };
    });
  };

  const handleZipMetadataChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const maxBytes = 50 * 1024 * 1024;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setProductFormError('Only .zip archive files are supported.');
      return;
    }
    if (file.size <= 0 || file.size > maxBytes) {
      setProductFormError('ZIP file must be between 1 byte and 50 MB.');
      return;
    }

    setProductFormError(null);
    setPendingZipFile(file);
    setProductForm((prev) => ({
      ...prev,
      zipMetadata: {
        fileName: file.name,
        sizeBytes: file.size,
        updatedAt: new Date().toISOString(),
        objectKey: prev.zipMetadata.objectKey ?? null,
        sampleDownloadPath: prev.zipMetadata.sampleDownloadPath,
      },
    }));
  };

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setProductFormError(null);

    const cleanName = productForm.name.trim();
    const cleanSlug = slugifyProductName(productForm.slug || cleanName);
    const cleanShortVi = productForm.shortDescVi.trim();
    const cleanShortEn = productForm.shortDescEn.trim();

    if (
      cleanName.length < 2 ||
      cleanSlug.length < 2 ||
      productForm.frameworks.length === 0 ||
      !cleanShortVi ||
      !cleanShortEn
    ) {
      setProductFormError(t.admin.productsSection.form.validationError);
      return;
    }

    setSavingProduct(true);
    try {
      let nextZipMetadata = { ...productForm.zipMetadata };

      if (pendingZipFile) {
        const signResponse = await fetch('/api/admin/storage/upload-url', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: cleanSlug,
            fileName: pendingZipFile.name,
            sizeBytes: pendingZipFile.size,
          }),
        });

        const signPayload = (await signResponse.json()) as {
          bucket?: string;
          objectKey?: string;
          token?: string;
          error?: string;
        };

        if (
          !signResponse.ok ||
          !signPayload.bucket ||
          !signPayload.objectKey ||
          !signPayload.token
        ) {
          throw new Error(
            signPayload.error ?? 'Failed to initialize private ZIP upload.',
          );
        }

        const supabase = createSupabaseBrowserClient();
        const { error: uploadError } = await supabase.storage
          .from(signPayload.bucket)
          .uploadToSignedUrl(
            signPayload.objectKey,
            signPayload.token,
            pendingZipFile,
            { contentType: 'application/zip' },
          );

        if (uploadError) {
          throw new Error(`Private Storage upload failed: ${uploadError.message}`);
        }

        nextZipMetadata = {
          fileName: pendingZipFile.name,
          sizeBytes: pendingZipFile.size,
          updatedAt: new Date().toISOString(),
          objectKey: signPayload.objectKey,
          sampleDownloadPath: null,
        };
      }

      const safeVnd =
        productForm.tier === 'free' ? 0 : Math.max(0, Math.round(productForm.priceVnd));
      const safeUsd =
        productForm.tier === 'free' ? 0 : Math.max(0, Math.round(productForm.priceUsd));

      const payload: CreateProductInput = {
        slug: cleanSlug,
        name: cleanName,
        type: productForm.type,
        tier: productForm.tier,
        status: productForm.status,
        category: productForm.category,
        frameworks: productForm.frameworks,
        tags: [productForm.category, productForm.type, ...productForm.frameworks],
        priceVnd: safeVnd,
        priceUsd: safeUsd,
        shortDescription: { vi: cleanShortVi, en: cleanShortEn },
        description: {
          vi: productForm.descVi.trim() || cleanShortVi,
          en: productForm.descEn.trim() || cleanShortEn,
        },
        documentation: {
          vi: productForm.docsVi.trim() || cleanShortVi,
          en: productForm.docsEn.trim() || cleanShortEn,
        },
        thumbnailVariant: productForm.thumbnailVariant,
        thumbnailSubtitle:
          productForm.thumbnailSubtitle.trim() || cleanShortEn || cleanName,
        previewMode: productForm.previewMode,
        previewComponentKey: productForm.previewComponentKey.trim() || null,
        supportsThemeToggle: productForm.supportsThemeToggle,
        featured: false,
        codeBundle: buildSanitizedCodeBundle(cleanSlug, cleanName),
        zipMetadata: nextZipMetadata,
      };

      if (editingProductId) {
        const existing = products.find((p) => p.id === editingProductId);
        await productRepository.update(editingProductId, {
          ...payload,
          featured: existing?.featured ?? false,
          codeBundle: existing?.codeBundle ?? payload.codeBundle,
        });
      } else {
        await productRepository.create(payload);
      }

      await loadAdminSnapshots();
      setPendingZipFile(null);
      setShowProductForm(false);
      setEditingProductId(null);
      showToast(t.admin.productsSection.savedNotice);
    } catch (error) {
      setProductFormError(
        error instanceof Error ? error.message : 'Unable to save product.',
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleProductStatus = async (product: Product): Promise<void> => {
    try {
      const nextStatus: ProductStatus =
        product.status === 'published' ? 'draft' : 'published';
      await productRepository.setStatus(product.id, nextStatus);
      await loadAdminSnapshots();
      showToast(
        `${product.name}: ${nextStatus.toUpperCase()} — ${t.admin.productsSection.statusUpdatedNotice}`,
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update product status.',
      );
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    try {
      await productRepository.delete(productId);
      setConfirmDeleteId(null);
      await loadAdminSnapshots();
      showToast(t.admin.productsSection.deletedNotice);
    } catch (error) {
      setConfirmDeleteId(null);
      showToast(
        error instanceof Error ? error.message : 'Failed to delete product.',
      );
    }
  };

  // Handlers for Coupon Form
  const handleSaveCoupon = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setCouponError(null);
    const cleanCode = couponForm.code.trim().toUpperCase().replace(/\s+/g, '');
    const safePercent = Math.round(couponForm.discountPercent);
    if (cleanCode.length < 2 || safePercent < 1 || safePercent > 100) {
      setCouponError(t.admin.couponsSection.validationError);
      return;
    }

    const isoExpiry = couponForm.expiresAtDate.includes('T')
      ? couponForm.expiresAtDate
      : `${couponForm.expiresAtDate || '2027-12-31'}T23:59:59.000Z`;

    try {
      await couponRepository.upsert({
        code: cleanCode,
        discountPercent: safePercent,
        active: couponForm.active,
        expiresAt: isoExpiry,
        description: {
          vi: couponForm.descVi.trim() || `Giảm ${safePercent}% cho mã ${cleanCode}.`,
          en: couponForm.descEn.trim() || `${safePercent}% off with code ${cleanCode}.`,
        },
      });

      await loadAdminSnapshots();
      setCouponForm(createEmptyCouponForm());
      showToast(t.admin.couponsSection.savedNotice);
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : 'Unable to save coupon.',
      );
    }
  };

  const handleToggleCouponActive = async (coupon: Coupon): Promise<void> => {
    try {
      await couponRepository.upsert({
        ...coupon,
        active: !coupon.active,
      });
      await loadAdminSnapshots();
      showToast(t.admin.couponsSection.savedNotice);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update coupon.');
    }
  };

  const handleEditCoupon = (coupon: Coupon): void => {
    setCouponForm({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      active: coupon.active,
      expiresAtDate: coupon.expiresAt.slice(0, 10),
      descVi: coupon.description.vi,
      descEn: coupon.description.en,
    });
  };

  const handleDeleteCoupon = async (code: string): Promise<void> => {
    try {
      await couponRepository.delete(code);
      await loadAdminSnapshots();
      showToast(t.admin.couponsSection.deletedNotice);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to delete coupon.');
    }
  };

  const handleResetDemoData = async (): Promise<void> => {
    resetAllDemoData();
    await hydrateAuth();
    await loadAdminSnapshots();
    setConfirmResetOpen(false);
    showToast(t.admin.settingsSection.resetDoneNotice);
  };

  // Hydration loading shell
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-[#0b0b0f]" />
      </div>
    );
  }

  // Mock Admin Role Gate (UI Demo ONLY — explicitly documented as non-security)
  if (!session || session.user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan">{t.admin.badge}</Badge>
          </div>

          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
            {t.admin.roleGate.title}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
            {t.admin.roleGate.description}
          </p>

          <div className="mt-4 rounded-lg border border-white/10 bg-[#050507] px-4 py-3 text-xs text-zinc-300">
            <span className="text-zinc-500">{t.admin.roleGate.currentRoleLabel} </span>
            <span className="font-mono font-semibold text-white">
              {session ? `${session.user.email} (${session.user.role})` : t.admin.roleGate.guestRole}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-200/90">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{t.admin.roleGate.securityNote}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="cyan" asChild>
              <Link href="/login?next=/admin">{t.admin.roleGate.goToLoginCta}</Link>
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link href="/library">{t.admin.roleGate.backToStoreCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems: Array<{
    key: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  }> = [
    { key: 'overview', label: t.admin.nav.overview, icon: LayoutDashboard },
    {
      key: 'products',
      label: t.admin.nav.products,
      icon: Package,
      badgeCount: products.length,
    },
    {
      key: 'orders',
      label: t.admin.nav.orders,
      icon: Receipt,
      badgeCount: orders.length,
    },
    {
      key: 'customers',
      label: t.admin.nav.customers,
      icon: Users,
      badgeCount: customerRows.length,
    },
    {
      key: 'coupons',
      label: t.admin.nav.coupons,
      icon: Tag,
      badgeCount: coupons.length,
    },
    { key: 'analytics', label: t.admin.nav.analytics, icon: BarChart3 },
    { key: 'settings', label: t.admin.nav.settings, icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Header & Security Boundary Disclaimer */}
      <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan">{t.admin.badge}</Badge>
              <Badge variant="outline" className="font-mono">
                {session.user.email}
              </Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t.admin.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-zinc-400">{t.admin.subtitle}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/library">{t.admin.overviewSection.viewCatalogCta}</Link>
            </Button>
            <Button type="button" variant="cyan" size="sm" onClick={handleOpenCreateProduct}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {t.admin.overviewSection.newProductCta}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-200/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span>{t.admin.demoSecurityBanner}</span>
        </div>
      </div>

      {/* Transient Feedback Banner */}
      {bannerMessage ? (
        <div
          role="status"
          className="mt-4 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-3 text-xs font-medium text-accent-cyan"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{bannerMessage}</span>
        </div>
      ) : null}

      {/* Main Responsive Sidebar + Workspace */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <nav
            aria-label="Admin sections"
            className="flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#0b0b0f] p-2.5 lg:sticky lg:top-24 lg:flex-col"
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors lg:w-full ${
                    isActive
                      ? 'border border-cyan-400/35 bg-cyan-400/15 text-accent-cyan'
                      : 'border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {typeof item.badgeCount === 'number' ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-200">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Active Panel */}
        <section className="min-w-0 lg:col-span-9">
          {loadingData ? (
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#0b0b0f]" />
          ) : null}

          {/* TAB 1: OVERVIEW */}
          {!loadingData && activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
                  <p className="text-xs text-zinc-400">{t.admin.overviewSection.totalProducts}</p>
                  <p className="mt-2 font-mono text-2xl font-bold text-white">
                    {metrics.totalProducts}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {metrics.publishedCount} {t.admin.overviewSection.publishedCount} •{' '}
                    {metrics.draftCount} {t.admin.overviewSection.draftCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
                  <p className="text-xs text-zinc-400">{t.admin.overviewSection.totalOrders}</p>
                  <p className="mt-2 font-mono text-2xl font-bold text-white">
                    {metrics.totalOrders}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">localStorage demo ledger</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
                  <p className="text-xs text-zinc-400">
                    {t.admin.overviewSection.simulatedRevenue}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold text-accent-cyan">
                    {formatMoneyAmount(
                      currency === 'VND' ? metrics.revenueVnd : metrics.revenueUsd,
                      currency,
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">Simulated paid checkouts</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
                  <p className="text-xs text-zinc-400">{t.admin.overviewSection.activeCoupons}</p>
                  <p className="mt-2 font-mono text-2xl font-bold text-white">
                    {metrics.activeCouponsCount} / {coupons.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('coupons')}
                    className="mt-1 text-[11px] font-medium text-accent-cyan hover:underline"
                  >
                    {t.admin.overviewSection.manageCouponsCta} →
                  </button>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-white">
                    {t.admin.overviewSection.recentOrdersTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-accent-cyan hover:underline"
                  >
                    {t.admin.nav.orders} →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-500">
                    {t.admin.overviewSection.noOrdersYet}
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-white/[0.06]">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
                      >
                        <div>
                          <p className="font-mono font-medium text-white">{order.id}</p>
                          <p className="text-zinc-400">
                            {order.customerEmail} • {order.items.length} item(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-white">
                            {formatMoneyAmount(
                              currency === 'VND' ? order.totalVnd : order.totalUsd,
                              currency,
                            )}
                          </p>
                          <span className="font-mono text-[10px] uppercase text-accent-cyan">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* TAB 2: PRODUCTS CRUD */}
          {!loadingData && activeTab === 'products' ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {t.admin.productsSection.title}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      {t.admin.productsSection.subtitle}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="cyan"
                    size="sm"
                    onClick={handleOpenCreateProduct}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.admin.productsSection.newProductCta}
                  </Button>
                </div>

                {/* Search + Status Filter */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
                      aria-hidden="true"
                    />
                    <input
                      id="admin-product-search"
                      name="productSearch"
                      type="text"
                      autoComplete="off"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={t.admin.productsSection.searchPlaceholder}
                      className="h-9 w-full rounded-lg border border-white/10 bg-[#050507] pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['all', 'published', 'draft'] as const).map((statusKey) => (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => setStatusFilter(statusKey)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          statusFilter === statusKey
                            ? 'border-cyan-400/40 bg-cyan-400/15 text-accent-cyan'
                            : 'border-white/10 bg-[#050507] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {statusKey === 'all'
                          ? t.admin.productsSection.statusFilterAll
                          : statusKey === 'published'
                            ? t.admin.productsSection.statusFilterPublished
                            : t.admin.productsSection.statusFilterDraft}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Create / Edit Product Form */}
              {showProductForm ? (
                <form
                  onSubmit={(e) => void handleSaveProduct(e)}
                  className="rounded-2xl border border-accent-cyan/35 bg-[#0b0b0f] p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-base font-semibold text-white">
                      {editingProductId
                        ? t.admin.productsSection.form.editTitle
                        : t.admin.productsSection.form.createTitle}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProductId(null);
                      }}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      {t.admin.productsSection.form.cancelBtn}
                    </button>
                  </div>

                  {productFormError ? (
                    <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                      {productFormError}
                    </div>
                  ) : null}

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="admin-product-name" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.nameLabel}
                        <input
                          id="admin-product-name"
                          name="name"
                          type="text"
                          autoComplete="off"
                          value={productForm.name}
                          onChange={(e) => handleProductNameChange(e.target.value)}
                          placeholder="Glass Command Palette"
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-slug" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.slugLabel}
                        <input
                          id="admin-product-slug"
                          name="slug"
                          type="text"
                          autoComplete="off"
                          value={productForm.slug}
                          onChange={(e) => {
                            setSlugTouched(true);
                            setProductForm((prev) => ({ ...prev, slug: e.target.value }));
                          }}
                          placeholder="glass-command-palette"
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs text-white focus:border-accent-cyan focus:outline-none"
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-type" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.typeLabel}
                        <select
                          id="admin-product-type"
                          name="type"
                          value={productForm.type}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              type: e.target.value as ProductType,
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          <option value="component">
                            {t.admin.productsSection.form.typeComponent}
                          </option>
                          <option value="template">
                            {t.admin.productsSection.form.typeTemplate}
                          </option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-tier" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.tierLabel}
                        <select
                          id="admin-product-tier"
                          name="tier"
                          value={productForm.tier}
                          onChange={(e) => {
                            const nextTier = e.target.value as ProductTier;
                            setProductForm((prev) => ({
                              ...prev,
                              tier: nextTier,
                              priceVnd: nextTier === 'free' ? 0 : prev.priceVnd || 290000,
                              priceUsd: nextTier === 'free' ? 0 : prev.priceUsd || 12,
                            }));
                          }}
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          <option value="paid">{t.admin.productsSection.form.tierPaid}</option>
                          <option value="free">{t.admin.productsSection.form.tierFree}</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-status" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.statusLabel}
                        <select
                          id="admin-product-status"
                          name="status"
                          value={productForm.status}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              status: e.target.value as ProductStatus,
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          <option value="published">
                            {t.admin.productsSection.statusPublished}
                          </option>
                          <option value="draft">{t.admin.productsSection.statusDraft}</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-category" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.categoryLabel}
                        <select
                          id="admin-product-category"
                          name="category"
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              category: e.target.value as ProductCategory,
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-price-vnd" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.priceVndLabel}
                        <input
                          id="admin-product-price-vnd"
                          name="priceVnd"
                          type="number"
                          min={0}
                          step={1000}
                          disabled={productForm.tier === 'free'}
                          value={productForm.tier === 'free' ? 0 : productForm.priceVnd}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              priceVnd: Math.max(0, Math.round(Number(e.target.value) || 0)),
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs text-white disabled:opacity-50 focus:border-accent-cyan focus:outline-none"
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-price-usd" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.priceUsdLabel}
                        <input
                          id="admin-product-price-usd"
                          name="priceUsd"
                          type="number"
                          min={0}
                          step={1}
                          disabled={productForm.tier === 'free'}
                          value={productForm.tier === 'free' ? 0 : productForm.priceUsd}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              priceUsd: Math.max(0, Math.round(Number(e.target.value) || 0)),
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs text-white disabled:opacity-50 focus:border-accent-cyan focus:outline-none"
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-thumb-variant" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.thumbnailVariantLabel}
                        <select
                          id="admin-product-thumb-variant"
                          name="thumbnailVariant"
                          value={productForm.thumbnailVariant}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              thumbnailVariant: e.target.value as 'dark' | 'light' | 'mixed',
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          <option value="dark">dark</option>
                          <option value="light">light</option>
                          <option value="mixed">mixed</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-thumb-sub" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.thumbnailSubtitleLabel}
                        <input
                          id="admin-product-thumb-sub"
                          name="thumbnailSubtitle"
                          type="text"
                          autoComplete="off"
                          value={productForm.thumbnailSubtitle}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              thumbnailSubtitle: e.target.value,
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-preview-mode" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.previewModeLabel}
                        <select
                          id="admin-product-preview-mode"
                          name="previewMode"
                          value={productForm.previewMode}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              previewMode: e.target.value as PreviewMode,
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          <option value="interactive-card">interactive-card</option>
                          <option value="thumbnail-modal">thumbnail-modal</option>
                          <option value="template-fullscreen">template-fullscreen</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-product-preview-key" className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.previewKeyLabel}
                        <select
                          id="admin-product-preview-key"
                          name="previewComponentKey"
                          value={productForm.previewComponentKey}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              previewComponentKey: e.target.value,
                            }))
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs text-white focus:border-accent-cyan focus:outline-none"
                        >
                          <option value="">
                            {t.admin.productsSection.form.previewKeyFallbackOption}
                          </option>
                          {SAFE_PREVIEW_KEYS.map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Frameworks checkboxes & theme toggle */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#050507] p-3.5">
                    <div>
                      <span className="block text-xs font-medium text-zinc-300">
                        {t.admin.productsSection.form.frameworksLabel}
                      </span>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {ALL_FRAMEWORKS.map((fw) => {
                          const checked = productForm.frameworks.includes(fw);
                          return (
                            <label
                              key={fw}
                              htmlFor={`admin-product-fw-${fw}`}
                              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-zinc-200"
                            >
                              <input
                                id={`admin-product-fw-${fw}`}
                                name={`framework-${fw}`}
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleFramework(fw)}
                                className="h-3.5 w-3.5 rounded border-white/20 accent-cyan-400"
                              />
                              <span className="font-mono uppercase">{fw}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <label
                      htmlFor="admin-product-theme-toggle"
                      className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-200"
                    >
                      <input
                        id="admin-product-theme-toggle"
                        name="supportsThemeToggle"
                        type="checkbox"
                        checked={productForm.supportsThemeToggle}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            supportsThemeToggle: e.target.checked,
                          }))
                        }
                        className="h-3.5 w-3.5 rounded border-white/20 accent-cyan-400"
                      />
                      <span>{t.admin.productsSection.form.supportsThemeToggleLabel}</span>
                    </label>
                  </div>

                  {/* Bilingual Descriptions */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label htmlFor="admin-product-short-vi" className="block text-xs font-medium text-zinc-300">
                      {t.admin.productsSection.form.shortDescViLabel}
                      <textarea
                        id="admin-product-short-vi"
                        name="shortDescVi"
                        rows={2}
                        value={productForm.shortDescVi}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, shortDescVi: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#050507] p-2.5 text-xs text-white focus:border-accent-cyan focus:outline-none"
                      />
                    </label>

                    <label htmlFor="admin-product-short-en" className="block text-xs font-medium text-zinc-300">
                      {t.admin.productsSection.form.shortDescEnLabel}
                      <textarea
                        id="admin-product-short-en"
                        name="shortDescEn"
                        rows={2}
                        value={productForm.shortDescEn}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, shortDescEn: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#050507] p-2.5 text-xs text-white focus:border-accent-cyan focus:outline-none"
                      />
                    </label>

                    <label htmlFor="admin-product-desc-vi" className="block text-xs font-medium text-zinc-300">
                      {t.admin.productsSection.form.descViLabel}
                      <textarea
                        id="admin-product-desc-vi"
                        name="descVi"
                        rows={2}
                        value={productForm.descVi}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, descVi: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#050507] p-2.5 text-xs text-white focus:border-accent-cyan focus:outline-none"
                      />
                    </label>

                    <label htmlFor="admin-product-desc-en" className="block text-xs font-medium text-zinc-300">
                      {t.admin.productsSection.form.descEnLabel}
                      <textarea
                        id="admin-product-desc-en"
                        name="descEn"
                        rows={2}
                        value={productForm.descEn}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, descEn: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#050507] p-2.5 text-xs text-white focus:border-accent-cyan focus:outline-none"
                      />
                    </label>
                  </div>

                  {/* Metadata-Only Source ZIP Upload */}
                  <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-[#050507] p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                          <FileArchive className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
                          {t.admin.productsSection.form.zipUploadTitle}
                        </h4>
                        <p className="mt-1 text-xs text-zinc-400">
                          {t.admin.productsSection.form.zipUploadSubtitle}
                        </p>
                      </div>

                      <div>
                        <input
                          id="admin-product-zip-upload"
                          name="zipMetadataFile"
                          ref={zipInputRef}
                          type="file"
                          accept=".zip,application/zip"
                          onChange={handleZipMetadataChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => zipInputRef.current?.click()}
                        >
                          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                          {t.admin.productsSection.form.zipSelectBtn}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-white/10 bg-[#0b0b0f] px-3 py-2 font-mono text-xs text-zinc-300">
                      <span className="text-zinc-500">
                        {t.admin.productsSection.form.zipCurrentMeta}{' '}
                      </span>
                      {productForm.zipMetadata.fileName ? (
                        <span className="text-accent-cyan">
                          {productForm.zipMetadata.fileName} (
                          {formatBytes(productForm.zipMetadata.sizeBytes)})
                        </span>
                      ) : (
                        <span>{t.admin.productsSection.form.zipNoFile}</span>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] text-amber-300/90">
                      {t.admin.productsSection.form.zipSecurityNotice}
                    </p>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProductId(null);
                        setPendingZipFile(null);
                      }}
                    >
                      {t.admin.productsSection.form.cancelBtn}
                    </Button>
                    <Button type="submit" variant="cyan" size="sm" disabled={savingProduct}>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {savingProduct ? t.auth.submitting : t.admin.productsSection.form.saveBtn}
                    </Button>
                  </div>
                </form>
              ) : null}

              {/* Product Rows List */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  <span className="font-mono font-semibold text-white">
                    {filteredProducts.length}
                  </span>{' '}
                  {t.admin.productsSection.countSummary}
                </p>

                {filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-8 text-center text-sm text-zinc-400">
                    {t.admin.productsSection.emptyState}
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isPublished = product.status === 'published';
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#0b0b0f] p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="truncate text-sm font-semibold text-white hover:text-accent-cyan"
                            >
                              {product.name}
                            </Link>
                            <Badge variant={isPublished ? 'cyan' : 'muted'}>
                              {isPublished
                                ? t.admin.productsSection.statusPublished
                                : t.admin.productsSection.statusDraft}
                            </Badge>
                            <span className="font-mono text-xs text-zinc-300">
                              {formatProductPrice(
                                product.priceVnd,
                                product.priceUsd,
                                currency,
                                t.foundation.freeLabel,
                              )}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                            <span className="font-mono text-zinc-500">/{product.slug}</span>
                            <span>
                              {product.type} • {product.category}
                            </span>
                            <span className="font-mono uppercase">
                              {product.frameworks.join(', ')}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono text-zinc-500">
                              <Archive className="h-3 w-3" aria-hidden="true" />
                              {product.zipMetadata.fileName} (
                              {formatBytes(product.zipMetadata.sizeBytes)})
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {product.zipMetadata.sampleDownloadPath ? (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={product.zipMetadata.sampleDownloadPath}
                                download={product.zipMetadata.fileName}
                              >
                                <Download className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                                ZIP
                              </a>
                            </Button>
                          ) : null}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleToggleProductStatus(product)}
                          >
                            {isPublished ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                {t.admin.productsSection.unpublishBtn}
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                                {t.admin.productsSection.publishBtn}
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditProduct(product)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            {t.admin.productsSection.editBtn}
                          </Button>

                          {confirmDeleteId === product.id ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleDeleteProduct(product.id)}
                              className="border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              OK?
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(product.id)}
                              className="text-zinc-400 hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.admin.productsSection.deleteBtn}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {/* TAB 3: ORDERS */}
          {!loadingData && activeTab === 'orders' ? (
            <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                {t.admin.ordersSection.title}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">{t.admin.ordersSection.subtitle}</p>

              {orders.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-[#050507] p-8 text-center text-sm text-zinc-400">
                  {t.admin.ordersSection.emptyState}
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-white/10 bg-[#050507] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            {order.id}
                          </span>
                          <Badge variant={order.status === 'failed' ? 'muted' : 'cyan'}>
                            {order.status === 'paid'
                              ? t.admin.ordersSection.statusPaid
                              : order.status === 'free_claimed'
                                ? t.admin.ordersSection.statusFreeClaimed
                                : t.admin.ordersSection.statusFailed}
                          </Badge>
                          {order.couponCode ? (
                            <Badge variant="outline" className="font-mono">
                              {order.couponCode} (-{order.discountPercent}%)
                            </Badge>
                          ) : null}
                        </div>

                        <span className="font-mono text-sm font-semibold text-white">
                          {formatMoneyAmount(
                            currency === 'VND' ? order.totalVnd : order.totalUsd,
                            currency,
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                        <span>{order.customerEmail}</span>
                        <span className="font-mono">
                          {new Date(order.createdAt).toLocaleString(
                            locale === 'vi' ? 'vi-VN' : 'en-US',
                          )}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {order.items.map((item) => (
                          <span
                            key={item.productId}
                            className="rounded border border-white/10 bg-[#0b0b0f] px-2 py-0.5 text-[11px] text-zinc-300"
                          >
                            {item.productName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* TAB 4: CUSTOMERS */}
          {!loadingData && activeTab === 'customers' ? (
            <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                {t.admin.customersSection.title}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                {t.admin.customersSection.subtitle}
              </p>

              <div className="mt-5 space-y-3">
                {customerRows.map((customer) => (
                  <div
                    key={customer.email}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#050507] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {customer.name}
                        </span>
                        <Badge variant={customer.role === 'admin' ? 'cyan' : 'muted'}>
                          {customer.role === 'admin'
                            ? t.admin.customersSection.roleAdmin
                            : t.admin.customersSection.roleCustomer}
                        </Badge>
                        {customer.isSyncedUser ? (
                          <Badge variant="outline">{t.admin.customersSection.verifiedBadge}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 font-mono text-xs text-zinc-400">{customer.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                      <span>
                        <strong className="font-mono text-white">{customer.orderCount}</strong>{' '}
                        {t.admin.customersSection.ordersCount}
                      </span>
                      {customer.email === session.user.email ? (
                        <span>
                          <strong className="font-mono text-accent-cyan">
                            {ownedProductIds.length}
                          </strong>{' '}
                          {t.admin.customersSection.ownedItemsCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* TAB 5: COUPONS CRUD */}
          {!loadingData && activeTab === 'coupons' ? (
            <div className="space-y-5">
              <form
                onSubmit={(e) => void handleSaveCoupon(e)}
                className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 sm:p-6"
              >
                <h2 className="text-lg font-semibold text-white">
                  {t.admin.couponsSection.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {t.admin.couponsSection.subtitle}
                </p>

                {couponError ? (
                  <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {couponError}
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label htmlFor="admin-coupon-code" className="block text-xs font-medium text-zinc-300">
                    {t.admin.couponsSection.codeLabel}
                    <input
                      id="admin-coupon-code"
                      name="couponCode"
                      type="text"
                      autoComplete="off"
                      value={couponForm.code}
                      onChange={(e) =>
                        setCouponForm((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="ADMIN25"
                      className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs uppercase text-white focus:border-accent-cyan focus:outline-none"
                    />
                  </label>

                  <label htmlFor="admin-coupon-percent" className="block text-xs font-medium text-zinc-300">
                    {t.admin.couponsSection.discountPercentLabel}
                    <input
                      id="admin-coupon-percent"
                      name="discountPercent"
                      type="number"
                      min={1}
                      max={100}
                      value={couponForm.discountPercent}
                      onChange={(e) =>
                        setCouponForm((prev) => ({
                          ...prev,
                          discountPercent: Math.round(Number(e.target.value) || 0),
                        }))
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs text-white focus:border-accent-cyan focus:outline-none"
                    />
                  </label>

                  <label htmlFor="admin-coupon-expires" className="block text-xs font-medium text-zinc-300">
                    {t.admin.couponsSection.expiresAtLabel}
                    <input
                      id="admin-coupon-expires"
                      name="expiresAtDate"
                      type="date"
                      value={couponForm.expiresAtDate}
                      onChange={(e) =>
                        setCouponForm((prev) => ({ ...prev, expiresAtDate: e.target.value }))
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 font-mono text-xs text-white focus:border-accent-cyan focus:outline-none"
                    />
                  </label>

                  <label htmlFor="admin-coupon-desc-vi" className="block text-xs font-medium text-zinc-300 sm:col-span-2">
                    {t.admin.couponsSection.descViLabel}
                    <input
                      id="admin-coupon-desc-vi"
                      name="descVi"
                      type="text"
                      autoComplete="off"
                      value={couponForm.descVi}
                      onChange={(e) =>
                        setCouponForm((prev) => ({ ...prev, descVi: e.target.value }))
                      }
                      placeholder="Giảm 25% dành riêng cho demo Admin."
                      className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                    />
                  </label>

                  <label htmlFor="admin-coupon-desc-en" className="block text-xs font-medium text-zinc-300">
                    {t.admin.couponsSection.descEnLabel}
                    <input
                      id="admin-coupon-desc-en"
                      name="descEn"
                      type="text"
                      autoComplete="off"
                      value={couponForm.descEn}
                      onChange={(e) =>
                        setCouponForm((prev) => ({ ...prev, descEn: e.target.value }))
                      }
                      placeholder="25% Admin demo discount."
                      className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#050507] px-3 text-xs text-white focus:border-accent-cyan focus:outline-none"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <label htmlFor="admin-coupon-active" className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-200">
                    <input
                      id="admin-coupon-active"
                      name="couponActive"
                      type="checkbox"
                      checked={couponForm.active}
                      onChange={(e) =>
                        setCouponForm((prev) => ({ ...prev, active: e.target.checked }))
                      }
                      className="h-3.5 w-3.5 rounded border-white/20 accent-cyan-400"
                    />
                    <span>{t.admin.couponsSection.activeLabel}</span>
                  </label>

                  <Button type="submit" variant="cyan" size="sm">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.admin.couponsSection.saveCouponBtn}
                  </Button>
                </div>
              </form>

              {/* Coupon List */}
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0b0f] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-0.5 font-mono text-xs font-bold text-accent-cyan">
                          {coupon.code}
                        </span>
                        <span className="font-mono text-sm font-semibold text-white">
                          -{coupon.discountPercent}%
                        </span>
                        <Badge variant={coupon.active ? 'cyan' : 'muted'}>
                          {coupon.active
                            ? t.admin.couponsSection.statusActive
                            : t.admin.couponsSection.statusInactive}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        {pickLocalizedText(coupon.description, locale)} •{' '}
                        <span className="font-mono text-zinc-500">
                          {coupon.expiresAt.slice(0, 10)}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleToggleCouponActive(coupon)}
                      >
                        {coupon.active
                          ? t.admin.couponsSection.deactivateBtn
                          : t.admin.couponsSection.activateBtn}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        {t.admin.couponsSection.editBtn}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDeleteCoupon(coupon.code)}
                        className="text-zinc-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.admin.couponsSection.deleteBtn}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* TAB 6: ANALYTICS (EXPLICITLY MOCKED) */}
          {!loadingData && activeTab === 'analytics' ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs font-semibold tracking-wide text-amber-200">
                {t.admin.analyticsSection.mockBanner}
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-white">
                  {t.admin.analyticsSection.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {t.admin.analyticsSection.subtitle}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Mock Monthly Revenue Bar Chart */}
                  <div className="rounded-xl border border-white/10 bg-[#050507] p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      {t.admin.analyticsSection.monthlyRevenueTitle}
                    </h3>
                    <div className="mt-5 flex h-44 items-end gap-3">
                      {MOCK_MONTHLY_REVENUE.map((point) => {
                        const barHeightPx = Math.max(12, Math.round((point.usd / 3800) * 104));
                        return (
                          <div
                            key={point.month}
                            className="flex flex-1 flex-col items-center justify-end gap-2"
                          >
                            <span className="font-mono text-[10px] text-zinc-400">
                              ${point.usd}
                            </span>
                            <div className="flex h-28 w-full items-end rounded bg-white/[0.04] p-0.5">
                              <div
                                className="w-full rounded-sm bg-accent-cyan transition-all"
                                style={{ height: `${barHeightPx}px` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-zinc-500">
                              {point.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Catalog Category Distribution (Live from current Admin products) */}
                  <div className="rounded-xl border border-white/10 bg-[#050507] p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      {t.admin.analyticsSection.categorySplitTitle}
                    </h3>
                    <div className="mt-4 space-y-2.5">
                      {categoryBreakdown.map((item) => (
                        <div key={item.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-zinc-300">{item.category}</span>
                            <span className="font-mono text-zinc-400">{item.count}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-accent-cyan"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Illustrative Mock Conversion Funnel */}
                <div className="mt-6 rounded-xl border border-white/10 bg-[#050507] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    {t.admin.analyticsSection.conversionFunnelTitle}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t.admin.analyticsSection.funnelViews, value: '12,480' },
                      { label: t.admin.analyticsSection.funnelPreviews, value: '5,910' },
                      { label: t.admin.analyticsSection.funnelCart, value: '1,340' },
                      { label: t.admin.analyticsSection.funnelPaid, value: '418' },
                    ].map((step) => (
                      <div
                        key={step.label}
                        className="rounded-lg border border-white/10 bg-[#0b0b0f] p-3"
                      >
                        <p className="text-[11px] text-zinc-400">{step.label}</p>
                        <p className="mt-1 font-mono text-lg font-bold text-white">
                          {step.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB 7: SETTINGS & RESET */}
          {!loadingData && activeTab === 'settings' ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-white">
                  {t.admin.settingsSection.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {t.admin.settingsSection.subtitle}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#050507] p-4">
                    <h3 className="text-sm font-semibold text-white">
                      {t.admin.settingsSection.publisherPolicyTitle}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                      {t.admin.settingsSection.publisherPolicyBody}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#050507] p-4">
                    <h3 className="text-sm font-semibold text-white">
                      {t.admin.settingsSection.storageBoundaryTitle}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                      {t.admin.settingsSection.storageBoundaryBody}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-[#0b0b0f] p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white">
                  {t.admin.settingsSection.resetTitle}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  {t.admin.settingsSection.resetDescription}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!confirmResetOpen ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmResetOpen(true)}
                      className="border-rose-500/40 text-rose-200 hover:bg-rose-500/15"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.admin.settingsSection.resetCta}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleResetDemoData()}
                        className="border-rose-500/50 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.admin.settingsSection.resetConfirmCta}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmResetOpen(false)}
                      >
                        {t.admin.settingsSection.resetCancelCta}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
