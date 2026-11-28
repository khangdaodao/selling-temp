/**
 * Server-enforced 403 Access Denied view displayed when a signed-in non-admin user
 * requests `/admin`. Receives verified user identity directly from the Server Component.
 *
 * Related: src/app/admin/page.tsx, src/lib/auth/server-auth.ts
 */

'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n-store';
import type { AuthUser } from '@/types/domain';

interface AdminForbiddenViewProps {
  user: AuthUser;
}

/**
 * Clean 403 Forbidden screen rendered only when PostgreSQL `role !== 'admin'`.
 */
export function AdminForbiddenView({ user }: AdminForbiddenViewProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-rose-500/25 bg-[#0b0b0f] p-6 sm:p-10">
        <Badge variant="outline" className="border-rose-500/40 text-rose-300">
          {t.admin.roleGate.forbiddenBadge}
        </Badge>

        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
          {t.admin.roleGate.forbiddenTitle}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
          {t.admin.roleGate.forbiddenBody}
        </p>

        <div className="mt-4 rounded-lg border border-white/10 bg-[#050507] px-4 py-3 text-xs text-zinc-300">
          <span className="text-zinc-500">{t.admin.roleGate.currentRoleLabel} </span>
          <span className="font-mono font-semibold text-white">
            {user.email} ({user.role})
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {t.admin.roleGate.roleSyncedHint}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="cyan" asChild>
            <Link href="/library">{t.admin.roleGate.backToStoreCta}</Link>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/account">{t.account.tabs.myLibrary}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
