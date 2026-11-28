/**
 * Supabase Auth repository implementation of `IAuthRepository`.
 * Coordinates browser Supabase Auth calls (`signInWithPassword`, `signUp`,
 * `resetPasswordForEmail`, `updateUser`, `signInWithOAuth`) while reading the
 * authoritative session & `public.users` role strictly from `/api/auth/session`.
 *
 * Security boundary: Never checks passwords or assigns roles in browser storage;
 * clears legacy Phase 1 `forma:v1:auth_session` keys automatically.
 *
 * Related: src/services/repositories/interfaces.ts, src/app/api/auth/session/route.ts
 */

import { getClientEnv } from '@/lib/env';
import { removeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AuthSession } from '@/types/domain';
import type {
  IAuthRepository,
  SignInWithPasswordInput,
  SignUpResult,
  SignUpWithPasswordInput,
} from './interfaces';

interface SessionApiPayload {
  session?: AuthSession | null;
  error?: string;
}

interface SupabaseAuthSettingsPayload {
  external?: Record<string, boolean>;
}

async function fetchServerSession(throwOnError = false): Promise<AuthSession | null> {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => ({}))) as SessionApiPayload;
  if (!response.ok) {
    if (throwOnError) {
      throw new Error(
        payload.error ?? `Failed to verify session with server (HTTP ${response.status}).`,
      );
    }
    return null;
  }

  return payload.session ?? null;
}

async function isGoogleOAuthEnabled(): Promise<boolean | null> {
  try {
    const env = getClientEnv();
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    const settings = (await response.json()) as SupabaseAuthSettingsPayload;
    return settings.external?.google === true;
  } catch {
    return null;
  }
}

export class SupabaseAuthRepository implements IAuthRepository {
  /** @inheritdoc */
  async getSession(): Promise<AuthSession | null> {
    removeStorage(STORAGE_KEYS.authSession);
    return fetchServerSession(false);
  }

  /** @inheritdoc */
  async signInWithPassword(input: SignInWithPasswordInput): Promise<AuthSession> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const session = await fetchServerSession(true);
    if (!session) {
      throw new Error('Signed in, but no active server cookie session was returned.');
    }
    return session;
  }

  /** @inheritdoc */
  async signUpWithPassword(input: SignUpWithPasswordInput): Promise<SignUpResult> {
    const supabase = createSupabaseBrowserClient();
    const cleanName = input.name.trim();

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: cleanName ? { full_name: cleanName } : undefined,
        emailRedirectTo: input.emailRedirectTo,
      },
    });

    if (error) {
      if (/rate limit/i.test(error.message)) {
        throw new Error('EMAIL_RATE_LIMIT_EXCEEDED');
      }
      throw new Error(error.message);
    }

    if (!data.session) {
      return {
        session: null,
        requiresEmailConfirmation: true,
      };
    }

    const session = await fetchServerSession(true);
    return {
      session,
      requiresEmailConfirmation: false,
    };
  }

  /** @inheritdoc */
  async sendPasswordResetEmail(input: {
    email: string;
    redirectTo: string;
  }): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(input.email.trim(), {
      redirectTo: input.redirectTo,
    });
    if (error) {
      if (/rate limit/i.test(error.message)) {
        throw new Error('EMAIL_RATE_LIMIT_EXCEEDED');
      }
      throw new Error(error.message);
    }
  }

  /** @inheritdoc */
  async updatePassword(newPassword: string): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  /** @inheritdoc */
  async signInWithGoogle(redirectTo: string): Promise<void> {
    const googleEnabled = await isGoogleOAuthEnabled();
    if (googleEnabled === false) {
      throw new Error('GOOGLE_PROVIDER_NOT_ENABLED');
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /** @inheritdoc */
  async updateProfile(input: { name: string }): Promise<AuthSession> {
    const response = await fetch('/api/auth/session', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: input.name }),
    });

    const payload = (await response.json()) as SessionApiPayload;
    if (!response.ok || !payload.session) {
      throw new Error(payload.error ?? 'Failed to update profile.');
    }

    return payload.session;
  }

  /** @inheritdoc */
  async signOut(): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    removeStorage(STORAGE_KEYS.authSession);
    if (error) {
      throw new Error(error.message);
    }
  }
}
