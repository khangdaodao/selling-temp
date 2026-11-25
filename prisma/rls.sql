-- Defense-in-depth Row Level Security (RLS) setup for `forma/` Phase 2.1.
-- All Phase 2 queries run strictly through Next.js Server Actions / Route Handlers via Prisma ORM.
-- Enabling RLS and revoking direct `anon` / `authenticated` PostgREST Data API privileges
-- prevents accidental public reads of sensitive columns (`zip_object_key`, `coupons`, `orders`, `users`).

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_code_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.products FROM anon, authenticated;
REVOKE ALL ON TABLE public.product_code_files FROM anon, authenticated;
REVOKE ALL ON TABLE public.coupons FROM anon, authenticated;
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.order_items FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_entitlements FROM anon, authenticated;

-- Harden Supabase's auto-created SECURITY DEFINER helper in `public` against Data API RPC calls.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
