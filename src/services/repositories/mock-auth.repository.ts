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

function computeAvatarInitials(name: string, fallbackEmail: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || fallbackEmail.slice(0, 2).toUpperCase()
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

    const cleanInputName = input.name?.trim();
    const resolvedName =
      cleanInputName || matchingPreset?.name || normalizedEmail.split('@')[0] || 'Demo User';
    const initials = computeAvatarInitials(resolvedName, normalizedEmail);

    const user: DemoUser = matchingPreset
      ? {
          ...matchingPreset,
          name: resolvedName,
          avatarInitials: initials,
        }
      : {
          id: `usr_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`,
          name: resolvedName,
          email: normalizedEmail,
          role: 'customer',
          avatarInitials: initials,
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
  async updateDemoProfile(input: { name: string; email: string }): Promise<AuthSession> {
    const current = await this.getSession();
    if (!current) {
      throw new Error('Cannot update profile without an active demo session.');
    }
    const cleanName = input.name.trim() || current.user.name;
    const cleanEmail = input.email.trim().toLowerCase() || current.user.email;
    const initials = computeAvatarInitials(cleanName, cleanEmail);

    const updatedSession: AuthSession = {
      ...current,
      user: {
        ...current.user,
        name: cleanName,
        email: cleanEmail,
        avatarInitials: initials,
      },
    };
    writeStorage(STORAGE_KEYS.authSession, updatedSession);
    return updatedSession;
  }

  /** @inheritdoc */
  async signOut(): Promise<void> {
    removeStorage(STORAGE_KEYS.authSession);
  }
}
