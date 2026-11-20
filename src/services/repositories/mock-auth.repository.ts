/**
 * Phase 1 localStorage-backed mock implementation of `IAuthRepository`.
 * Security boundary: Simulates user sign-in purely for demo UX. Does NOT hash,
 * store, or validate passwords, and does NOT execute real Google OAuth.
 *
 * TODO(Phase 2): Replace with real server-side authentication compatible with MySQL.
 *
 * Related: src/services/repositories/interfaces.ts, src/mocks/accounts.seed.ts
 */

import { readStorage, removeStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { STORAGE_KEYS } from '@/lib/storage/storage-keys';
import { SEED_DEMO_ACCOUNTS } from '@/mocks/accounts.seed';
import type { AuthSession, DemoUser } from '@/types/domain';
import type { IAuthRepository } from './interfaces';

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as AuthSession;
  return (
    typeof candidate.signedInAt === 'string' &&
    typeof candidate.authProvider === 'string' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null &&
    typeof candidate.user.id === 'string' &&
    typeof candidate.user.email === 'string'
  );
}

export class MockAuthRepository implements IAuthRepository {
  /** @inheritdoc */
  getDemoAccounts(): DemoUser[] {
    return [...SEED_DEMO_ACCOUNTS];
  }

  /** @inheritdoc */
  async getSession(): Promise<AuthSession | null> {
    return readStorage<AuthSession | null>(
      STORAGE_KEYS.authSession,
      null,
      (val): val is AuthSession | null => val === null || isAuthSession(val),
    );
  }

  /** @inheritdoc */
  async signInWithDemoAccount(accountId: string): Promise<AuthSession> {
    const found =
      SEED_DEMO_ACCOUNTS.find((account) => account.id === accountId) ??
      SEED_DEMO_ACCOUNTS[0];
    if (!found) {
      throw new Error('No preset demo account available.');
    }
    const session: AuthSession = {
      user: found,
      authProvider: 'demo-preset',
      signedInAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.authSession, session);
    return session;
  }

  /** @inheritdoc */
  async signInWithDemoForm(input: { email: string; name?: string }): Promise<AuthSession> {
    const normalizedEmail = input.email.trim().toLowerCase() || 'customer@forma.demo';
    const matchingPreset = SEED_DEMO_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === normalizedEmail,
    );

    const user: DemoUser = matchingPreset ?? {
      id: `usr_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`,
      name: input.name?.trim() || normalizedEmail.split('@')[0] || 'Demo User',
      email: normalizedEmail,
      role: 'customer',
      avatarInitials: (input.name?.trim() || normalizedEmail).slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      user,
      authProvider: 'demo-form',
      signedInAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.authSession, session);
    return session;
  }

  /** @inheritdoc */
  async signInWithGoogleDemoUi(): Promise<AuthSession> {
    const customerPreset = SEED_DEMO_ACCOUNTS[0];
    if (!customerPreset) {
      throw new Error('Default customer demo account is missing.');
    }
    const session: AuthSession = {
      user: customerPreset,
      authProvider: 'demo-google-ui',
      signedInAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.authSession, session);
    return session;
  }

  /** @inheritdoc */
  async signOut(): Promise<void> {
    removeStorage(STORAGE_KEYS.authSession);
  }
}
