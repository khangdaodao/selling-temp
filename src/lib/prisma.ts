/**
 * Singleton PrismaClient instance for forma/ server-side queries against Supabase PostgreSQL.
 * Caches the client on `globalThis` during development to prevent exhausting PgBouncer/Postgres
 * connections across Next.js App Router hot reloads.
 *
 * Security boundary: Import ONLY inside Server Components, Server Actions, Route Handlers,
 * or CLI scripts (`prisma/seed.ts`) — never inside client components.
 *
 * Related: prisma/schema.prisma, src/lib/env.ts
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  formaPrisma?: PrismaClient;
};

/**
 * Shared Prisma ORM client connected to Supabase PostgreSQL (`DATABASE_URL`).
 */
export const prisma: PrismaClient =
  globalForPrisma.formaPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.formaPrisma = prisma;
}
