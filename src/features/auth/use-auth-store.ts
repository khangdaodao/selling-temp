/**
 * Zustand store managing Phase 1 mock authentication session, simulated orders,
 * and client-side product ownership (`ownedProductIds`).
 *
 * Security boundary: All state here is simulated in browser localStorage for Phase 1 UX only.
 * Never trust browser auth state, orders, or ownership as authority in Phase 2 production APIs.
 *
 * TODO(Phase 2): Replace with server-verified session cookies and MySQL entitlement queries.
 *
 * Related: src/services/repositories/mock-auth.repository.ts, src/services/repositories/mock-order.repository.ts
 */

'use client';

import { create } from 'zustand';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { authRepository, orderRepository } from '@/services';
import type {
  AuthSession,
  CurrencyCode,
  Order,
  PaymentSimulationOutcome,
  Product,
} from '@/types/domain';

interface AuthState {
  session: AuthSession | null;
  ownedProductIds: string[];
  orders: Order[];
  hydrated: boolean;
  hydrateAuth: () => Promise<void>;
  signInWithPreset: (accountId: string) => Promise<AuthSession>;
  signInWithForm: (input: { email: string; name?: string }) => Promise<AuthSession>;
  signInWithGoogleDemo: () => Promise<AuthSession>;
  updateProfile: (input: { name: string; email: string }) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  claimFreeProduct: (product: Product, currencyUsed: CurrencyCode) => Promise<Order>;
  placeSimulatedOrder: (input: {
    products: Product[];
    couponCode: string | null;
    currencyUsed: CurrencyCode;
    outcome: PaymentSimulationOutcome;
  }) => Promise<Order>;
}

/**
 * Global Zustand store coordinating mock authentication and unlocked product entitlements.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  ownedProductIds: [],
  orders: [],
  hydrated: false,

  hydrateAuth: async () => {
    const [session, ownedProductIds, orders] = await Promise.all([
      authRepository.getSession(),
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ session, ownedProductIds, orders, hydrated: true });
  },

  signInWithPreset: async (accountId) => {
    const session = await authRepository.signInWithDemoAccount(accountId);
    const [ownedProductIds, orders] = await Promise.all([
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ session, ownedProductIds, orders, hydrated: true });
    return session;
  },

  signInWithForm: async (input) => {
    const session = await authRepository.signInWithDemoForm(input);
    const [ownedProductIds, orders] = await Promise.all([
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ session, ownedProductIds, orders, hydrated: true });
    return session;
  },

  signInWithGoogleDemo: async () => {
    const session = await authRepository.signInWithGoogleDemoUi();
    const [ownedProductIds, orders] = await Promise.all([
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ session, ownedProductIds, orders, hydrated: true });
    return session;
  },

  updateProfile: async (input) => {
    const session = await authRepository.updateDemoProfile(input);
    set({ session });
    return session;
  },

  signOut: async () => {
    await authRepository.signOut();
    set({ session: null });
  },

  claimFreeProduct: async (product, currencyUsed) => {
    const session = get().session;
    if (!session) {
      throw new Error('Mock sign-in is required before claiming free items.');
    }
    const order = await orderRepository.claimFreeProduct(
      session.user,
      product,
      currencyUsed,
    );
    const [ownedProductIds, orders] = await Promise.all([
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ ownedProductIds, orders });
    return order;
  },

  placeSimulatedOrder: async (input) => {
    const session = get().session;
    if (!session) {
      throw new Error('Mock sign-in is required before placing a simulated order.');
    }
    const order = await orderRepository.placeSimulatedOrder({
      user: session.user,
      products: input.products,
      couponCode: input.couponCode,
      currencyUsed: input.currencyUsed,
      outcome: input.outcome,
    });
    const [ownedProductIds, orders] = await Promise.all([
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ ownedProductIds, orders });
    return order;
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener(DEMO_RESET_EVENT, () => {
    useAuthStore.setState({
      session: null,
      ownedProductIds: [],
      orders: [],
      hydrated: true,
    });
  });
}
