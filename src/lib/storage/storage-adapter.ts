/**
 * Centralized, SSR-safe browser localStorage adapter for forma/ Phase 1.
 * All repositories and Zustand stores MUST read/write browser storage through this adapter
 * instead of calling `window.localStorage` directly inside React components.
 *
 * Invariants:
 * - Returns `defaultValue` cleanly on the server (`typeof window === 'undefined'`).
 * - Wraps stored payloads in a versioned envelope `{ version, updatedAt, data }`.
 * - Recovers gracefully from malformed JSON, quota errors, or schema mismatches.
 *
 * Related: src/lib/storage/storage-keys.ts, src/services/repositories/*
 */

import {
  DEMO_RESET_EVENT,
  STORAGE_KEYS,
  STORAGE_SCHEMA_VERSION,
  type StorageKey,
} from './storage-keys';

/** Versioned envelope persisted to localStorage for every managed key. */
interface StorageEnvelope<T> {
  version: string;
  updatedAt: string;
  data: T;
}

/** Optional runtime type guard used to verify deserialized storage payloads. */
export type StorageValidator<T> = (value: unknown) => value is T;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isStorageEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.version === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    'data' in candidate
  );
}

/**
 * Reads and validates a typed value from localStorage.
 * Falls back to `defaultValue` if running during SSR, if the key does not exist,
 * if JSON parsing fails, if the envelope version mismatches, or if `validator` rejects the payload.
 *
 * @param key - Registered storage key from `STORAGE_KEYS`.
 * @param defaultValue - Safe fallback returned on missing or corrupted data.
 * @param validator - Optional type predicate ensuring structural integrity.
 * @returns Validated stored value or `defaultValue`.
 */
export function readStorage<T>(
  key: StorageKey,
  defaultValue: T,
  validator?: StorageValidator<T>,
): T {
  if (!isBrowser()) {
    return defaultValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isStorageEnvelope(parsed) || parsed.version !== STORAGE_SCHEMA_VERSION) {
      console.warn(`[StorageAdapter] Schema version mismatch for "${key}". Reverting to defaults.`);
      window.localStorage.removeItem(key);
      return defaultValue;
    }

    if (validator && !validator(parsed.data)) {
      console.warn(`[StorageAdapter] Validation failed for "${key}". Reverting to defaults.`);
      window.localStorage.removeItem(key);
      return defaultValue;
    }

    return parsed.data as T;
  } catch (error) {
    console.warn(`[StorageAdapter] Failed to parse "${key}". Reverting to defaults.`, error);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore cleanup errors in restricted storage environments.
    }
    return defaultValue;
  }
}

/**
 * Serializes and writes a value to localStorage inside a versioned envelope.
 * No-op during SSR; logs a warning rather than throwing if browser storage quota is exceeded.
 *
 * @param key - Registered storage key from `STORAGE_KEYS`.
 * @param value - Serializable data payload to persist.
 * @returns `true` if persisted successfully, `false` otherwise.
 */
export function writeStorage<T>(key: StorageKey, value: T): boolean {
  if (!isBrowser()) {
    return false;
  }

  const envelope: StorageEnvelope<T> = {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    data: value,
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch (error) {
    console.warn(`[StorageAdapter] Failed to write "${key}".`, error);
    return false;
  }
}

/**
 * Removes a single managed key from localStorage.
 *
 * @param key - Registered storage key from `STORAGE_KEYS`.
 */
export function removeStorage(key: StorageKey): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[StorageAdapter] Failed to remove "${key}".`, error);
  }
}

/**
 * Clears all `forma:v1:*` keys from localStorage and notifies subscribed listeners
 * so stores and UI can re-hydrate from seed defaults cleanly.
 */
export function resetAllDemoData(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      window.localStorage.removeItem(key);
    }
    window.dispatchEvent(new CustomEvent(DEMO_RESET_EVENT));
  } catch (error) {
    console.warn('[StorageAdapter] Failed to reset demo data.', error);
  }
}
