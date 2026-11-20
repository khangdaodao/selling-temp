/**
 * Preset demo user accounts for Phase 1 mock authentication.
 * Security boundary: No real passwords, password hashes, or Google OAuth secrets
 * exist or are verified here. Accounts are selected purely for UI demonstration.
 *
 * TODO(Phase 2): Replace with database-backed User records and real session verification.
 *
 * Related: src/types/domain.ts, src/services/repositories/mock-auth.repository.ts
 */

import type { DemoUser } from '@/types/domain';

export const SEED_DEMO_ACCOUNTS: DemoUser[] = [
  {
    id: 'usr_demo_customer',
    name: 'Minh Nguyen (Customer Demo)',
    email: 'customer@forma.demo',
    role: 'customer',
    avatarInitials: 'MN',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'usr_demo_admin',
    name: 'Linh Tran (Admin Demo)',
    email: 'admin@forma.demo',
    role: 'admin',
    avatarInitials: 'LT',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];
