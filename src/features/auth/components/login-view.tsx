/**
 * Mock authentication page view (`/login`) closely following Reference Screen #3.
 * Supports Login, Register, and Forgot Password simulated UI modes, Google UI Demo,
 * and 1-click Preset Demo Accounts (`customer@forma.demo`, `admin@forma.demo`),
 * redirecting safely back to `?next=` (such as `/checkout`) after sign-in.
 *
 * Security boundary: Phase 1 does NOT store, hash, or verify real passwords, and does NOT
 * request or validate real Google OAuth credentials.
 *
 * Related: src/app/login/page.tsx, src/features/auth/use-auth-store.ts
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useI18n } from '@/i18n/use-i18n-store';
import { authRepository } from '@/services';

type AuthMode = 'login' | 'register' | 'forgot';

function resolveSafeNextPath(rawNext: string | null): string {
  if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) {
    return rawNext;
  }
  return '/library';
}

/**
 * Minimalist dark authentication screen matching forma/ Reference Screen #3.
 */
export function LoginView(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const session = useAuthStore((state) => state.session);
  const signInWithPreset = useAuthStore((state) => state.signInWithPreset);
  const signInWithForm = useAuthStore((state) => state.signInWithForm);
  const signInWithGoogleDemo = useAuthStore((state) => state.signInWithGoogleDemo);
  const signOut = useAuthStore((state) => state.signOut);

  const nextPath = resolveSafeNextPath(searchParams.get('next'));
  const returningToCheckout = nextPath.startsWith('/checkout');
  const presetAccounts = authRepository.getDemoAccounts();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@forma.demo');
  const [password, setPassword] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const finishSignIn = (): void => {
    router.push(nextPath);
  };

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (mode === 'forgot') {
      setStatusNotice(t.auth.forgotSentNotice);
      return;
    }
    await signInWithForm({
      email,
      name: mode === 'register' ? name : undefined,
    });
    finishSignIn();
  };

  const handlePresetClick = async (accountId: string): Promise<void> => {
    await signInWithPreset(accountId);
    finishSignIn();
  };

  const handleGoogleDemoClick = async (): Promise<void> => {
    await signInWithGoogleDemo();
    finishSignIn();
  };

  return (
    <div className="min-h-[82vh] bg-[#050505] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Back Navigation */}
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Badge variant="muted" className="font-mono text-[10px]">
            Demo Auth • Phase 1
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

          {session ? (
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
                <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                  {t.auth.signOut}
                </Button>
              </div>
            </div>
          ) : null}

          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            {t.auth.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {mode === 'login'
              ? t.auth.loginTitle
              : mode === 'register'
                ? t.auth.registerTitle
                : t.auth.forgotTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'login'
              ? t.auth.loginSubtitle
              : mode === 'register'
                ? t.auth.registerSubtitle
                : t.auth.forgotSubtitle}
          </p>

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#101014] px-3 text-sm text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                />
              </div>
            ) : null}

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

            {mode !== 'forgot' ? (
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    {t.auth.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setStatusNotice(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-accent-cyan"
                  >
                    {t.auth.forgotLink}
                  </button>
                </div>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#101014] px-3 text-sm text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none"
                />
              </div>
            ) : null}

            <Button type="submit" variant="default" size="lg" className="w-full">
              <span>
                {mode === 'login'
                  ? t.auth.submitLogin
                  : mode === 'register'
                    ? t.auth.submitRegister
                    : t.auth.submitForgot}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

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
                setStatusNotice(null);
              }}
              className="hover:text-white"
            >
              {mode === 'register' ? t.auth.switchToLogin : t.auth.switchToRegister}
            </button>
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStatusNotice(null);
                }}
                className="text-accent-cyan hover:underline"
              >
                {t.auth.switchToLogin}
              </button>
            ) : null}
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3 text-[11px] text-zinc-500">
            <div className="h-px flex-1 bg-white/10" />
            <span>{t.auth.orDivider}</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google UI Demo Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => void handleGoogleDemoClick()}
          >
            <Sparkles className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
            <span>{t.auth.googleDemoCta}</span>
          </Button>

          {/* Preset Demo Accounts */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#0c0c10] p-4">
            <p className="text-xs font-semibold text-zinc-200">{t.auth.presetHeading}</p>
            <div className="mt-3 space-y-2">
              {presetAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => void handlePresetClick(account.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#121217] px-3 py-2.5 text-left transition-colors hover:border-accent-cyan/50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 font-mono text-[11px] font-semibold text-white">
                      {account.avatarInitials}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{account.name}</p>
                      <p className="font-mono text-[10px] text-zinc-400">
                        {account.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={account.role === 'admin' ? 'cyan' : 'muted'}>
                    <UserCheck className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {account.role === 'admin'
                        ? t.auth.presetAdminRole
                        : t.auth.presetCustomerRole}
                    </span>
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Phase 1 Security Boundary Disclosure */}
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#0a0a0d] p-3.5 text-[11px] leading-relaxed text-zinc-400">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" aria-hidden="true" />
            <p>{t.auth.demoBoundaryNotice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
