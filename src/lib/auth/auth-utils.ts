/**
 * Pure authentication helper utilities shared safely across Client and Server modules.
 * Provides open-redirect protection (`resolveSafeNextPath`), initials calculation,
 * and email normalization without importing server-only secrets.
 *
 * Related: src/lib/auth/server-auth.ts, src/app/auth/callback/route.ts,
 * src/features/auth/components/login-view.tsx
 */

/**
 * Validates and resolves an internal post-authentication redirect path.
 * Blocks protocol-relative URLs (`//evil.com`) and external origins to prevent open redirects.
 */
export function resolveSafeNextPath(
  rawNext: string | null | undefined,
  fallback = '/library',
): string {
  if (!rawNext) {
    return fallback;
  }
  const trimmed = rawNext.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed;
  }
  return fallback;
}

/**
 * Normalizes an email address into trimmed lowercase form.
 */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Computes two-character uppercase initials from a display name or fallback email.
 */
export function computeAvatarInitials(name: string, fallbackEmail: string): string {
  const fromName = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (fromName) {
    return fromName;
  }

  return fallbackEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'FM';
}
