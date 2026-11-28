/**
 * Zustand store coordinating client authentication state against server-verified
 * Supabase Auth (`/api/auth/session`) alongside product ownership & orders.
 *
 * Security boundary: Never checks passwords or assigns `role` client-side. Authoritative
 * user identity and RBAC roles always originate from PostgreSQL `public.users` on the server.
 * Note: `ownedProductIds` and `orders` stay linked to `orderRepository` until Phase 2.4.
 *
 * Related: src/services/repositories/supabase-auth.repository.ts, src/app/api/auth/session/route.ts
 */

'use client';

import { create } from 'zustand';
import { DEMO_RESET_EVENT } from '@/lib/storage/storage-keys';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  authRepository,
  orderRepository,
  type SignUpResult,
} from '@/services';
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
  signInWithPassword: (input: { email: string; password: string }) => Promise<AuthSession>;
  signUpWithPassword: (input: {
    name: string;
    email: string;
    password: string;
    emailRedirectTo?: string;
  }) => Promise<SignUpResult>;
  requestPasswordReset: (input: { email: string; redirectTo: string }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  updateProfile: (input: { name: string }) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  claimFreeProduct: (product: Product, currencyUsed: CurrencyCode) => Promise<Order>;
  placeSimulatedOrder: (input: {
    products: Product[];
    couponCode: string | null;
    currencyUsed: CurrencyCode;
    outcome: PaymentSimulationOutcome;
  }) => Promise<Order>;
}

let authSubscriptionBound = false;

function ensureAuthStateSubscription(hydrateFn: () => Promise<void>): void {
  if (typeof window === 'undefined' || authSubscriptionBound) {
    return;
  }
  authSubscriptionBound = true;

  try {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void hydrateFn();
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ session: null, hydrated: true });
      }
    });
  } catch {
    // Ignore client initialization warnings if env variables are temporarily unavailable.
  }
}

/**
 * Global Zustand store coordinating verified Supabase sessions and storefront entitlements.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  ownedProductIds: [],
  orders: [],
  hydrated: false,

  hydrateAuth: async () => {
    ensureAuthStateSubscription(get().hydrateAuth);

    const [session, ownedProductIds, orders] = await Promise.all([
      authRepository.getSession(),
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ session, ownedProductIds, orders, hydrated: true });
  },

  signInWithPassword: async (input) => {
    const session = await authRepository.signInWithPassword(input);
    const [ownedProductIds, orders] = await Promise.all([
      orderRepository.getOwnedProductIds(),
      orderRepository.getAllOrders(),
    ]);
    set({ session, ownedProductIds, orders, hydrated: true });
    return session;
  },

  signUpWithPassword: async (input) => {
    const result = await authRepository.signUpWithPassword(input);
    if (result.session) {
      const [ownedProductIds, orders] = await Promise.all([
        orderRepository.getOwnedProductIds(),
        orderRepository.getAllOrders(),
      ]);
      set({ session: result.session, ownedProductIds, orders, hydrated: true });
    }
    return result;
  },

  requestPasswordReset: async (input) => {
    await authRepository.sendPasswordResetEmail(input);
  },

  updatePassword: async (newPassword) => {
    await authRepository.updatePassword(newPassword);
    await get().hydrateAuth();
  },

  signInWithGoogle: async (redirectTo) => {
    await authRepository.signInWithGoogle(redirectTo);
  },

  updateProfile: async (input) => {
    const session = await authRepository.updateProfile(input);
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
      throw new Error('Authentication is required before claiming free items.');
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
      throw new Error('Authentication is required before placing an order.');
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
      ownedProductIds: [],
      orders: [],
      hydrated: true,
    });
  });
}
