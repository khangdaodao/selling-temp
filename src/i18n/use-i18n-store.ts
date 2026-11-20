/**
 * Zustand store managing bilingual locale (`vi` / `en`) and fixed display currency (`VND` / `USD`).
 * Persists user preference through the centralized StorageAdapter and detects browser language
 * safely after client mount to prevent Next.js SSR hydration mismatches.
 *
 * Related: src/i18n/types.ts, src/lib/storage/storage-adapter.ts
 */

'use client';

import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage/storage-adapter';
import { DEMO_RESET_EVENT, STORAGE_KEYS } from '@/lib/storage/storage-keys';
import type { CurrencyCode, Locale, LocalizedText } from '@/types/domain';
import { enDictionary } from './dictionaries/en';
import { viDictionary } from './dictionaries/vi';
import type { TranslationDictionary } from './types';

interface I18nState {
  locale: Locale;
  currency: CurrencyCode;
  hydrated: boolean;
  setLocale: (locale: Locale, syncCurrency?: boolean) => void;
  setCurrency: (currency: CurrencyCode) => void;
  hydrateFromEnvironment: () => void;
}

function isLocale(value: unknown): value is Locale {
  return value === 'vi' || value === 'en';
}

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === 'VND' || value === 'USD';
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'vi';
  }
  const preferred = navigator.language.toLowerCase();
  return preferred.startsWith('vi') ? 'vi' : 'en';
}

/**
 * Global Zustand store for active UI locale and fixed catalog display currency.
 * Starts with deterministic defaults (`vi` / `VND`) during SSR and synchronizes
 * with localStorage or `navigator.language` inside `hydrateFromEnvironment()`.
 */
export const useI18nStore = create<I18nState>((set, get) => ({
  locale: 'vi',
  currency: 'VND',
  hydrated: false,

  setLocale: (locale, syncCurrency = false) => {
    writeStorage(STORAGE_KEYS.locale, locale);
    if (syncCurrency) {
      const nextCurrency: CurrencyCode = locale === 'vi' ? 'VND' : 'USD';
      writeStorage(STORAGE_KEYS.currency, nextCurrency);
      set({ locale, currency: nextCurrency });
      return;
    }
    set({ locale });
  },

  setCurrency: (currency) => {
    writeStorage(STORAGE_KEYS.currency, currency);
    set({ currency });
  },

  hydrateFromEnvironment: () => {
    if (get().hydrated) {
      return;
    }

    const storedLocale = readStorage<Locale | null>(
      STORAGE_KEYS.locale,
      null,
      (val): val is Locale | null => val === null || isLocale(val),
    );
    const detectedLocale = storedLocale ?? detectBrowserLocale();

    const defaultCurrency: CurrencyCode = detectedLocale === 'vi' ? 'VND' : 'USD';
    const storedCurrency = readStorage<CurrencyCode | null>(
      STORAGE_KEYS.currency,
      null,
      (val): val is CurrencyCode | null => val === null || isCurrencyCode(val),
    );
    const resolvedCurrency = storedCurrency ?? defaultCurrency;

    if (storedLocale === null) {
      writeStorage(STORAGE_KEYS.locale, detectedLocale);
    }
    if (storedCurrency === null) {
      writeStorage(STORAGE_KEYS.currency, resolvedCurrency);
    }

    set({
      locale: detectedLocale,
      currency: resolvedCurrency,
      hydrated: true,
    });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener(DEMO_RESET_EVENT, () => {
    const detectedLocale = detectBrowserLocale();
    const defaultCurrency: CurrencyCode = detectedLocale === 'vi' ? 'VND' : 'USD';
    useI18nStore.setState({
      locale: detectedLocale,
      currency: defaultCurrency,
      hydrated: true,
    });
  });
}

/**
 * Convenience hook returning the active translation dictionary, locale, currency, and setters.
 *
 * @returns Active dictionary object and i18n actions.
 */
export function useI18n(): {
  t: TranslationDictionary;
  locale: Locale;
  currency: CurrencyCode;
  hydrated: boolean;
  setLocale: (locale: Locale, syncCurrency?: boolean) => void;
  setCurrency: (currency: CurrencyCode) => void;
  hydrateFromEnvironment: () => void;
} {
  const locale = useI18nStore((state) => state.locale);
  const currency = useI18nStore((state) => state.currency);
  const hydrated = useI18nStore((state) => state.hydrated);
  const setLocale = useI18nStore((state) => state.setLocale);
  const setCurrency = useI18nStore((state) => state.setCurrency);
  const hydrateFromEnvironment = useI18nStore((state) => state.hydrateFromEnvironment);

  return {
    t: locale === 'vi' ? viDictionary : enDictionary,
    locale,
    currency,
    hydrated,
    setLocale,
    setCurrency,
    hydrateFromEnvironment,
  };
}

/**
 * Selects the localized string from a bilingual `LocalizedText` object.
 *
 * @param text - Bilingual text field containing `vi` and `en` variants.
 * @param locale - Active UI locale.
 * @returns Localized string.
 */
export function pickLocalizedText(text: LocalizedText, locale: Locale): string {
  return locale === 'vi' ? text.vi : text.en;
}
