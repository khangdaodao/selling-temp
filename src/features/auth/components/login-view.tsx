/**
 * Production authentication page view (`/login`) powered by Supabase Auth (`@supabase/ssr`).
 * Closely follows forma/ Reference Screen #3 dark minimalism aesthetic and supports:
 * - Email + Password Sign In & Registration (synchronized to PostgreSQL `public.users`)
 * - Forgot Password email recovery & `?mode=reset` password update
 * - Google OAuth (`signInWithOAuth` redirecting via `/auth/callback`)
 * - Safe `?next=` return redirects via `resolveSafeNextPath`
 *
 * Security boundary: Never stores passwords locally, exposes preset demo accounts,
 * or accepts client-submitted authorization roles.
 *
 * Related: src/app/login/page.tsx, src/features/auth/use-auth-store.ts, src/app/auth/callback/route.ts
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useI18n } from '@/i18n/use-i18n-store';
import { resolveSafeNextPath } from '@/lib/auth/auth-utils';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

/**
 * Minimalist dark authentication screen backed by Supabase Auth.
 */
export function LoginView(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const session = useAuthStore((state) => state.session);
  const signInWithPassword = useAuthStore((state) => state.signInWithPassword);
  const signUpWithPassword = useAuthStore((state) => state.signUpWithPassword);
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signOut = useAuthStore((state) => state.signOut);

  const nextPath = resolveSafeNextPath(searchParams.get('next'));
  const returningToCheckout = nextPath.startsWith('/checkout');
  const requestedMode = searchParams.get('mode');
  const callbackError = searchParams.get('error');

  const [mode, setMode] = useState<AuthMode>(
    requestedMode === 'reset' ? 'reset' : requestedMode === 'register' ? 'register' : 'login',
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    callbackError ? t.auth.callbackErrorNotice : null,
  );

  useEffect(() => {
    if (requestedMode === 'reset') {
      setMode('reset');
    } else if (requestedMode === 'register') {
      setMode('register');
    }
  }, [requestedMode]);

  useEffect(() => {
    if (callbackError) {
      setErrorMessage(t.auth.callbackErrorNotice);
    }
  }, [callbackError, t.auth.callbackErrorNotice]);

  const finishSignIn = (): void => {
    router.push(nextPath);
    router.refresh();
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.refresh();
  };

  const resolveAuthErrorMessage = (error: unknown): string => {
    const message =
      error instanceof Error ? error.message : 'Authentication failed. Please try again.';
    if (message === 'GOOGLE_PROVIDER_NOT_ENABLED') {
      return t.auth.googleNotConfiguredError;
    }
    if (message === 'EMAIL_RATE_LIMIT_EXCEEDED') {
      return t.auth.emailRateLimitError;
    }
    return message;
  };

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusNotice(null);
    setSubmitting(true);

    try {
      if (mode === 'forgot') {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/login?mode=reset')}`;
        await requestPasswordReset({ email, redirectTo });
        setStatusNotice(t.auth.forgotSentNotice);
        return;
      }

      if (mode === 'reset') {
        await updatePassword(password);
        setPassword('');
        setStatusNotice(t.auth.resetSuccessNotice);
        setMode('login');
        return;
      }

      if (mode === 'register') {
        const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
        const result = await signUpWithPassword({
          name,
          email,
          password,
          emailRedirectTo: callbackUrl,
        });

        if (result.requiresEmailConfirmation) {
          setStatusNotice(t.auth.emailConfirmationNotice);
          setMode('login');
          return;
        }

        finishSignIn();
        return;
      }

      await signInWithPassword({ email, password });
      finishSignIn();
    } catch (error) {
      setErrorMessage(resolveAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async (): Promise<void> => {
    setErrorMessage(null);
    setStatusNotice(null);
    setSubmitting(true);

    try {
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      await signInWithGoogle(callbackUrl);
    } catch (error) {
      setErrorMessage(resolveAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  const headingTitle =
    mode === 'login'
      ? t.auth.loginTitle
      : mode === 'register'
        ? t.auth.registerTitle
        : mode === 'reset'
          ? t.auth.resetTitle
          : t.auth.forgotTitle;

  const headingSubtitle =
    mode === 'login'
      ? t.auth.loginSubtitle
      : mode === 'register'
        ? t.auth.registerSubtitle
        : mode === 'reset'
          ? t.auth.resetSubtitle
          : t.auth.forgotSubtitle;

  return (
    <div className="min-h-[82vh] bg-[#050505] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Back Navigation */}
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Badge variant="muted" className="font-mono text-[10px]">
            {t.auth.securityBadge}
          </Badge>
          <Link
            href={nextPath}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.auth.backLabel}</span>
          </Link>
        </div>

        {/* Centered Auth Container */}
        <div className="mx-auto mt-8 max-w-md">
          {returningToCheckout ? (
            <div className="mb-5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-3 text-xs text-accent-cyan">
              {t.auth.returnToCheckoutBanner}
            </div>
          ) : null}

          {session && mode !== 'reset' ? (
            <div className="forma-surface mb-6 flex items-center justify-between gap-3 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-cyan/15 font-mono text-xs font-bold text-accent-cyan">
                  {session.user.avatarInitials}
                </span>
                <div>
                  <p className="text-xs text-zinc-400">{t.auth.signedInAs}</p>
                  <p className="text-sm font-semibold text-white">{session.user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="cyan" size="sm" onClick={finishSignIn}>
                  <span>{returningToCheckout ? 'Checkout' : 'Library'}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                  {t.auth.signOut}
                </Button>
              </div>
            </div>
          ) : null}

          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            {t.auth.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {headingTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{headingSubtitle}</p>

          <form onSubmit={(e) => void handleFormSubmit(e)} className="mt-7 space-y-4">
            {mode === 'register' ? (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-zinc-300"
                >
                  {t.auth.nameLabel}
                </label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#101014] px-3 text-sm text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                />
              </div>
            ) : null}

            {mode !== 'reset' ? (
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-zinc-300"
                >
                  {t.auth.emailLabel}
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#101014] px-3 text-sm text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                />
              </div>
            ) : null}

            {mode !== 'forgot' ? (
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    {mode === 'reset' ? t.auth.newPasswordLabel : t.auth.passwordLabel}
                  </label>
                  {mode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setStatusNotice(null);
                      }}
                      className="text-xs text-zinc-400 hover:text-accent-cyan"
                    >
                      {t.auth.forgotLink}
                    </button>
                  ) : null}
                </div>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'register' || mode === 'reset' ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#101014] px-3 text-sm text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                />
              </div>
            ) : null}

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={submitting}
              className="w-full"
            >
              <span>
                {submitting
                  ? t.auth.submitting
                  : mode === 'login'
                    ? t.auth.submitLogin
                    : mode === 'register'
                      ? t.auth.submitRegister
                      : mode === 'reset'
                        ? t.auth.submitReset
                        : t.auth.submitForgot}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          {errorMessage ? (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200"
            >
              {errorMessage}
            </div>
          ) : null}

          {statusNotice ? (
            <div
              role="status"
              className="mt-4 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 p-3 text-xs leading-relaxed text-accent-cyan"
            >
              {statusNotice}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMessage(null);
                setStatusNotice(null);
              }}
              className="hover:text-white"
            >
              {mode === 'register' ? t.auth.switchToLogin : t.auth.switchToRegister}
            </button>
            {mode === 'forgot' || mode === 'reset' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setStatusNotice(null);
                }}
                className="text-accent-cyan hover:underline"
              >
                {t.auth.switchToLogin}
              </button>
            ) : null}
          </div>

          {mode !== 'reset' ? (
            <>
              {/* Divider */}
              <div className="my-6 flex items-center gap-3 text-[11px] text-zinc-500">
                <div className="h-px flex-1 bg-white/10" />
                <span>{t.auth.orDivider}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={submitting}
                className="w-full"
                onClick={() => void handleGoogleClick()}
              >
                <Sparkles className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
                <span>{t.auth.googleCta}</span>
              </Button>
            </>
          ) : null}

          {/* Server Auth Security Note */}
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#0a0a0d] p-3.5 text-[11px] leading-relaxed text-zinc-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" aria-hidden="true" />
            <p>{t.auth.securityNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
