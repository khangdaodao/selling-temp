/**
 * One-Page Checkout view (`/checkout`) for forma/ Phase 1.
 * - Requires mock sign-in before placing an order, guiding guests to `/login?next=/checkout`.
 * - Prunes already-owned products automatically to prevent duplicate purchases.
 * - Validates promo codes via `couponRepository` and calculates integer VND/USD totals.
 * - Simulates Payment Success / Failure states and persists Order History to localStorage.
 *
 * Security boundary: All totals, coupon eligibility, and payment outcomes in Phase 1
 * run locally in the browser for demo UX ONLY and MUST be re-verified server-side in Phase 2.
 *
 * Related: src/app/checkout/page.tsx, src/features/cart/use-cart-store.ts
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCartStore } from '@/features/cart/use-cart-store';
import { useI18n } from '@/i18n/use-i18n-store';
import {
  calculateIntegerDiscount,
  formatMoneyAmount,
} from '@/lib/format/currency';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { couponRepository, productRepository } from '@/services';
import type {
  Coupon,
  Order,
  PaymentSimulationOutcome,
  Product,
} from '@/types/domain';

/**
 * Interactive One-Page Checkout screen with mock auth gate, coupon testing,
 * payment simulation toggle, and persisted localStorage order history.
 */
export function CheckoutView(): React.JSX.Element {
  const { t, currency } = useI18n();
  const session = useAuthStore((state) => state.session);
  const ownedProductIds = useAuthStore((state) => state.ownedProductIds);
  const orders = useAuthStore((state) => state.orders);
  const signInWithPreset = useAuthStore((state) => state.signInWithPreset);
  const placeSimulatedOrder = useAuthStore((state) => state.placeSimulatedOrder);

  const items = useCartStore((state) => state.items);
  const storedCouponCode = useCartStore((state) => state.couponCode);
  const setStoredCouponCode = useCartStore((state) => state.setCouponCode);
  const removeItem = useCartStore((state) => state.removeItem);
  const pruneOwnedItems = useCartStore((state) => state.pruneOwnedItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [couponInput, setCouponInput] = useState(storedCouponCode ?? '');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<PaymentSimulationOutcome>('success');
  const [submitting, setSubmitting] = useState(false);
  const [prunedNotice, setPrunedNotice] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [failedOrderError, setFailedOrderError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      const list = await productRepository.getAll();
      if (active) {
        setCatalog(list);
      }
    };
    void load();

    const handleReset = (): void => {
      setAppliedCoupon(null);
      setCouponInput('');
      setCouponError(null);
      setConfirmedOrder(null);
      setFailedOrderError(false);
      void load();
    };
    window.addEventListener(DEMO_RESET_EVENT, handleReset);
    return () => {
      active = false;
      window.removeEventListener(DEMO_RESET_EVENT, handleReset);
    };
  }, []);

  useEffect(() => {
    if (!storedCouponCode) {
      setAppliedCoupon(null);
      return;
    }
    let active = true;
    const revalidate = async (): Promise<void> => {
      const res = await couponRepository.validateCode(storedCouponCode);
      if (active) {
        if (res.valid && res.coupon) {
          setAppliedCoupon(res.coupon);
          setCouponInput(res.coupon.code);
        } else {
          setStoredCouponCode(null);
          setAppliedCoupon(null);
        }
      }
    };
    void revalidate();
    return () => {
      active = false;
    };
  }, [storedCouponCode, setStoredCouponCode]);

  useEffect(() => {
    if (!session || ownedProductIds.length === 0 || confirmedOrder !== null || submitting) {
      return;
    }
    const hadOwned = items.some((item) => ownedProductIds.includes(item.productId));
    if (hadOwned) {
      pruneOwnedItems(ownedProductIds);
      setPrunedNotice(true);
    }
  }, [session, ownedProductIds, items, pruneOwnedItems, confirmedOrder, submitting]);

  const cartProducts = useMemo(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    return items
      .map((item) => byId.get(item.productId))
      .filter((product): product is Product => product !== undefined);
  }, [catalog, items]);

  const subtotalVnd = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.priceVnd, 0),
    [cartProducts],
  );
  const subtotalUsd = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.priceUsd, 0),
    [cartProducts],
  );

  const discountPercent = appliedCoupon?.discountPercent ?? 0;
  const discountVnd = calculateIntegerDiscount(subtotalVnd, discountPercent);
  const discountUsd = calculateIntegerDiscount(subtotalUsd, discountPercent);
  const totalVnd = Math.max(0, subtotalVnd - discountVnd);
  const totalUsd = Math.max(0, subtotalUsd - discountUsd);

  const activeSubtotal = currency === 'VND' ? subtotalVnd : subtotalUsd;
  const activeDiscount = currency === 'VND' ? discountVnd : discountUsd;
  const activeTotal = currency === 'VND' ? totalVnd : totalUsd;

  const handleApplyCoupon = async (codeOverride?: string): Promise<void> => {
    const codeToCheck = codeOverride ?? couponInput;
    if (codeOverride !== undefined) {
      setCouponInput(codeOverride);
    }
    setCouponError(null);
    const result = await couponRepository.validateCode(codeToCheck);
    if (!result.valid || !result.coupon) {
      const reason = result.reason ?? 'not_found';
      setAppliedCoupon(null);
      setStoredCouponCode(null);
      setCouponError(t.checkout.couponErrors[reason]);
      return;
    }
    setAppliedCoupon(result.coupon);
    setStoredCouponCode(result.coupon.code);
    setCouponInput(result.coupon.code);
  };

  const handleRemoveCoupon = (): void => {
    setAppliedCoupon(null);
    setStoredCouponCode(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (!session || cartProducts.length === 0 || submitting) {
      return;
    }
    setSubmitting(true);
    setFailedOrderError(false);

    const order = await placeSimulatedOrder({
      products: cartProducts,
      couponCode: appliedCoupon?.code ?? null,
      currencyUsed: currency,
      outcome,
    });

    if (order.status === 'failed') {
      setSubmitting(false);
      setFailedOrderError(true);
      return;
    }

    setConfirmedOrder(order);
    setPrunedNotice(false);
    clearCart();
    setAppliedCoupon(null);
    setCouponInput('');
    setSubmitting(false);
  };

  const userOrders = session
    ? orders.filter((ord) => ord.userId === session.user.id)
    : [];

  return (
    <div className="min-h-[82vh] bg-canvas pb-20 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.checkout.backToLibrary}</span>
          </Link>
          <Badge variant="cyan" className="text-[10px]">
            {t.checkout.eyebrow}
          </Badge>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {t.checkout.title}
        </h1>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent-cyan/25 bg-accent-cyan/5 px-4 py-3 text-xs text-zinc-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" aria-hidden="true" />
          <p>{t.checkout.demoWarning}</p>
        </div>

        {prunedNotice ? (
          <div className="mt-4 rounded-xl border border-white/15 bg-surface px-4 py-3 text-xs text-zinc-200">
            {t.checkout.ownedPrunedNotice}
          </div>
        ) : null}

        {/* Confirmed Order Receipt */}
        {confirmedOrder ? (
          <div className="mt-8 rounded-2xl border border-accent-cyan/40 bg-[#0b1014] p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent-cyan" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t.checkout.successTitle}
                </h2>
                <p className="mt-1 text-sm text-zinc-300">
                  {t.checkout.successSubtitle}
                </p>
                <p className="mt-2 font-mono text-xs text-accent-cyan">
                  {t.checkout.orderIdLabel}: {confirmedOrder.id} •{' '}
                  {formatMoneyAmount(
                    currency === 'VND'
                      ? confirmedOrder.totalVnd
                      : confirmedOrder.totalUsd,
                    currency,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {t.checkout.unlockedHeading}
                </p>
                <Button variant="cyan" size="sm" asChild>
                  <Link href="/account">
                    <span>{t.account.tabs.myLibrary}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {confirmedOrder.items.map((item) => {
                  const matched = catalog.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d0d11] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.productName}
                        </p>
                        <p className="font-mono text-[11px] text-accent-cyan">
                          {t.cart.ownedBadge}
                        </p>
                      </div>
                      {matched ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/products/${matched.slug}`}>
                            <span>{t.checkout.viewUnlockedProduct}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* Checkout Workspace or Empty State */}
        {!confirmedOrder && cartProducts.length === 0 ? (
          <div className="forma-surface mt-8 flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-white">{t.checkout.emptyTitle}</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400">{t.checkout.emptyBody}</p>
            <Button variant="default" size="default" className="mt-6" asChild>
              <Link href="/library">{t.checkout.emptyCta}</Link>
            </Button>
          </div>
        ) : null}

        {!confirmedOrder && cartProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 7 Cols: Auth Gate + Order Items + Payment Simulation */}
            <div className="space-y-6 lg:col-span-7">
              {/* Mock Auth Requirement Gate */}
              {!session ? (
                <div className="rounded-2xl border border-accent-cyan/40 bg-[#0b1014] p-6">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent-cyan" aria-hidden="true" />
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        {t.checkout.authRequiredTitle}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                        {t.checkout.authRequiredBody}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <Button variant="cyan" size="sm" asChild>
                          <Link href="/login?next=/checkout">
                            <span>{t.checkout.authRequiredCta}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void signInWithPreset('usr_demo_customer')}
                        >
                          {t.checkout.quickDemoCustomerCta}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="forma-surface flex items-center justify-between rounded-xl px-4 py-3 text-xs">
                  <span className="text-zinc-400">
                    {t.auth.signedInAs}:{' '}
                    <strong className="text-white">{session.user.email}</strong>
                  </span>
                  <Badge variant="cyan">{session.user.role}</Badge>
                </div>
              )}

              {/* Order Line Items */}
              <div className="forma-surface rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white">
                  {t.checkout.orderItemsHeading} ({cartProducts.length})
                </h2>
                <ul className="mt-4 space-y-3">
                  {cartProducts.map((product) => {
                    const price =
                      currency === 'VND' ? product.priceVnd : product.priceUsd;
                    return (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0a0a0e] px-4 py-3"
                      >
                        <div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-sm font-semibold text-white hover:text-accent-cyan"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[11px] text-zinc-500">
                            {product.type} · {product.frameworks.join(' · ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-white">
                            {formatMoneyAmount(price, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(product.id)}
                            aria-label={`${t.cart.removeItem}: ${product.name}`}
                            className="rounded p-1.5 text-zinc-400 hover:bg-white/5 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Payment Outcome Simulation Selector */}
              <div className="forma-surface rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white">
                  {t.checkout.paymentHeading}
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        id: 'success',
                        title: t.checkout.paymentSuccessLabel,
                        desc: t.checkout.paymentSuccessDesc,
                      },
                      {
                        id: 'failure',
                        title: t.checkout.paymentFailureLabel,
                        desc: t.checkout.paymentFailureDesc,
                      },
                    ] as const
                  ).map((option) => {
                    const active = outcome === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setOutcome(option.id);
                          setFailedOrderError(false);
                        }}
                        aria-pressed={active}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          active
                            ? option.id === 'success'
                              ? 'border-accent-cyan bg-accent-cyan/10'
                              : 'border-red-400/60 bg-red-500/10'
                            : 'border-white/10 bg-[#0b0b0f] hover:border-white/25'
                        }`}
                      >
                        <p className="text-xs font-semibold text-white">{option.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                          {option.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Coupon & Summary */}
            <div className="lg:col-span-5">
              <div className="forma-surface sticky top-24 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white">
                  {t.checkout.couponHeading}
                </h2>

                <div className="mt-3 flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
                      aria-hidden="true"
                    />
                    <input
                      id="checkout-coupon"
                      name="coupon"
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t.checkout.couponPlaceholder}
                      aria-label={t.checkout.couponHeading}
                      className="h-9 w-full rounded-lg border border-white/10 bg-[#101014] pl-8 pr-3 font-mono text-xs uppercase text-white placeholder:normal-case placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                    />
                  </div>
                  {appliedCoupon ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCoupon}
                    >
                      {t.checkout.couponRemove}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleApplyCoupon()}
                    >
                      {t.checkout.couponApply}
                    </Button>
                  )}
                </div>

                {/* Quick coupon hint pills */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                  <span>{t.checkout.couponHintsLabel}</span>
                  {(['FORMA20', 'WELCOME10', 'EXPIRED50'] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => void handleApplyCoupon(code)}
                      className="rounded border border-white/10 bg-[#121217] px-2 py-0.5 font-mono text-[10px] text-zinc-300 hover:border-accent-cyan/50 hover:text-accent-cyan"
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {appliedCoupon ? (
                  <p className="mt-3 text-xs text-accent-cyan">
                    {t.checkout.couponApplied}: <strong>{appliedCoupon.code}</strong> (-
                    {appliedCoupon.discountPercent}%)
                  </p>
                ) : null}

                {couponError ? (
                  <p
                    role="alert"
                    className="mt-3 flex items-center gap-1.5 text-xs text-red-400"
                  >
                    <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{couponError}</span>
                  </p>
                ) : null}

                {/* Totals */}
                <div className="mt-6 space-y-2.5 border-t border-white/[0.08] pt-5 text-sm">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>{t.cart.subtotalLabel}</span>
                    <span className="font-mono text-zinc-200">
                      {formatMoneyAmount(activeSubtotal, currency)}
                    </span>
                  </div>

                  {discountPercent > 0 ? (
                    <div className="flex items-center justify-between text-accent-cyan">
                      <span>
                        {t.cart.discountLabel} (-{discountPercent}%)
                      </span>
                      <span className="font-mono">
                        -{formatMoneyAmount(activeDiscount, currency)}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-base font-semibold text-white">
                    <span>{t.cart.totalLabel}</span>
                    <span className="font-mono text-xl">
                      {formatMoneyAmount(activeTotal, currency)}
                    </span>
                  </div>
                </div>

                {failedOrderError ? (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-red-200">
                        {t.checkout.failureBannerTitle}
                      </p>
                      <p className="mt-1 leading-relaxed">{t.checkout.failureBannerBody}</p>
                    </div>
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant="cyan"
                  size="lg"
                  disabled={!session || submitting}
                  onClick={() => void handlePlaceOrder()}
                  className="mt-6 w-full"
                >
                  <span>{t.checkout.placeOrderCta}</span>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Persisted Order History */}
        {session && userOrders.length > 0 ? (
          <section className="mt-14 border-t border-white/[0.08] pt-8">
            <h2 className="text-base font-semibold text-white">
              {t.checkout.recentOrdersHeading} ({userOrders.length})
            </h2>
            <div className="mt-4 space-y-3">
              {userOrders.map((ord) => {
                const amount =
                  ord.currencyUsed === 'VND' ? ord.totalVnd : ord.totalUsd;
                const statusLabel =
                  ord.status === 'paid'
                    ? t.checkout.statusPaid
                    : ord.status === 'failed'
                      ? t.checkout.statusFailed
                      : t.checkout.statusFreeClaimed;
                return (
                  <div
                    key={ord.id}
                    className="forma-surface flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="font-mono font-semibold text-white">{ord.id}</p>
                      <p className="mt-0.5 text-zinc-400">
                        {ord.items.map((item) => item.productName).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          ord.status === 'failed'
                            ? 'outline'
                            : 'cyan'
                        }
                      >
                        {statusLabel}
                      </Badge>
                      <span className="font-mono font-semibold text-white">
                        {formatMoneyAmount(amount, ord.currencyUsed)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
