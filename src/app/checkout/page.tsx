/**
 * App Router Server Component entrypoint for `/checkout`.
 * Wraps `CheckoutView` inside React `<Suspense>` cleanly.
 *
 * Related: src/features/checkout/components/checkout-view.tsx
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CheckoutView } from '@/features/checkout/components/checkout-view';

export const metadata: Metadata = {
  title: 'Checkout (Demo) — forma/',
  description: 'Thanh toán một trang mô phỏng với kiểm tra mã giảm giá trên forma/.',
};

/**
 * `/checkout` Server Component route wrapper.
 */
export default function CheckoutPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-xs text-zinc-500">
          Loading checkout...
        </div>
      }
    >
      <CheckoutView />
    </Suspense>
  );
}
