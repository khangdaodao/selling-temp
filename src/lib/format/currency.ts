/**
 * Integer-based dual-currency formatting and discount arithmetic for forma/.
 * Uses pre-defined integer VND and USD amounts per product to avoid floating-point
 * rounding issues and real-time exchange-rate ambiguity in Phase 1 demo mode.
 *
 * TODO(Phase 2): Replace or augment with server-validated payment currency rules
 * and minor-unit amounts (e.g., USD cents) required by the selected payment gateway.
 *
 * Related: src/types/domain.ts, src/lib/format/currency.ts
 */

import type { CurrencyCode } from '@/types/domain';

const vndFormatter = new Intl.NumberFormat('vi-VN');
const usdFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

/**
 * Formats a non-negative integer monetary amount into its localized display string.
 *
 * @param amount - Non-negative integer amount (VND or whole USD). Negative values are clamped to 0.
 * @param currency - Target display currency (`'VND'` or `'USD'`).
 * @returns Formatted currency string (e.g., `"490.000đ"` or `"$19"`).
 */
export function formatMoneyAmount(amount: number, currency: CurrencyCode): string {
  const safeInteger = Math.max(0, Math.round(amount));
  if (currency === 'VND') {
    return `${vndFormatter.format(safeInteger)}đ`;
  }
  return `$${usdFormatter.format(safeInteger)}`;
}

/**
 * Formats a product's catalog price based on its fixed dual-currency values,
 * returning the localized "Free" label when the active price is `0`.
 *
 * @param priceVnd - Integer VND price (`0` for free products).
 * @param priceUsd - Integer USD price (`0` for free products).
 * @param currency - Active display currency.
 * @param freeLabel - Localized text shown when price equals `0` (e.g., `"Miễn phí"` or `"Free"`).
 * @returns Display-ready price string.
 */
export function formatProductPrice(
  priceVnd: number,
  priceUsd: number,
  currency: CurrencyCode,
  freeLabel: string,
): string {
  const activeAmount = currency === 'VND' ? priceVnd : priceUsd;
  if (activeAmount <= 0) {
    return freeLabel;
  }
  return formatMoneyAmount(activeAmount, currency);
}

/**
 * Computes an integer discount amount from an integer subtotal and integer percentage.
 * Invariant: Result is always an integer clamped to `[0, safeSubtotal]`.
 *
 * @param subtotal - Integer subtotal in VND or USD.
 * @param discountPercent - Integer discount percentage from `0` to `100`.
 * @returns Integer discount amount.
 */
export function calculateIntegerDiscount(
  subtotal: number,
  discountPercent: number,
): number {
  const safeSubtotal = Math.max(0, Math.round(subtotal));
  const safePercent = Math.min(100, Math.max(0, Math.round(discountPercent)));
  if (safeSubtotal === 0 || safePercent === 0) {
    return 0;
  }
  const discount = Math.round((safeSubtotal * safePercent) / 100);
  return Math.min(safeSubtotal, discount);
}
