-- =============================================================================
-- Row Level Security — every table, every role.
-- Default deny. Each policy is the most restrictive that still permits the
-- intended use case. The corresponding tests live in tests/security/rls.test.ts
-- and assert this matrix on every PR.
-- =============================================================================

-- Enable RLS on every table
alter table public.profiles       enable row level security;
alter table public.athletes       enable row level security;
alter table public.holdings       enable row level security;
alter table public.trades         enable row level security;
alter table public.price_history  enable row level security;
alter table public.stat_events    enable row level security;
alter table public.chat_messages  enable row level security;
alter table public.referrals      enable row level security;
alter table public.audit_logs     enable row level security;

-- Force RLS even for table owners (defense in depth)
alter table public.profiles       force row level security;
alter table public.holdings       force row level security;
alter table public.trades         force row level security;
alter table public.referrals      force row level security;
alter table public.audit_logs     force row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: self update (limited columns)"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- NOTE: column-level grants below restrict which columns the user may UPDATE.

-- Inserts and deletes go through edge functions / route handlers using the
-- service-role key. No client-side INSERT/DELETE policies are granted.

-- -----------------------------------------------------------------------------
-- athletes — public catalog, read-only for all
-- -----------------------------------------------------------------------------
create policy "athletes: anyone reads active"
  on public.athletes for select
  using (is_active);
-- Writes only via service_role.

-- -----------------------------------------------------------------------------
-- holdings — strictly self-owned
-- -----------------------------------------------------------------------------
create policy "holdings: self read"
  on public.holdings for select
  using (auth.uid() = user_id);
-- All writes go through the place_trade() RPC running as security-definer.

-- -----------------------------------------------------------------------------
-- trades — strictly self-owned, immutable from client
-- -----------------------------------------------------------------------------
create policy "trades: self read"
  on public.trades for select
  using (auth.uid() = user_id);
-- No client INSERT/UPDATE/DELETE — RPC only.

-- -----------------------------------------------------------------------------
-- price_history — public read
-- -----------------------------------------------------------------------------
create policy "price_history: public read"
  on public.price_history for select
  using (true);

-- -----------------------------------------------------------------------------
-- stat_events — server-only
-- -----------------------------------------------------------------------------
-- No client policies. service_role bypasses RLS for the webhook handler.

-- -----------------------------------------------------------------------------
-- chat_messages — read by any authenticated user, write by self (rate-limited
-- in the route handler), soft-delete by author only
-- -----------------------------------------------------------------------------
create policy "chat: authenticated read non-deleted"
  on public.chat_messages for select
  to authenticated
  using (deleted_at is null);

create policy "chat: self insert"
  on public.chat_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "chat: self soft-delete"
  on public.chat_messages for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- referrals — read self only, no client writes (service_role creates the row)
-- -----------------------------------------------------------------------------
create policy "referrals: self read"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- -----------------------------------------------------------------------------
-- audit_logs — never client-readable
-- -----------------------------------------------------------------------------
-- No policies granted. Only service_role can read.

-- -----------------------------------------------------------------------------
-- Column-level: revoke direct UPDATE rights on sensitive profile columns.
-- Even though the row policy permits "self update," the user must not be able
-- to change virtual_balance, mfa_enrolled, is_age_verified, or referred_by.
-- -----------------------------------------------------------------------------
revoke update on public.profiles from authenticated;
grant  update (display_name, avatar_url, phone_e164) on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Helpful: deny all on schema by default, then re-grant explicit minimum.
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant select on public.athletes      to anon, authenticated;
grant select on public.price_history to anon, authenticated;
grant select on public.profiles      to authenticated;
grant select on public.holdings      to authenticated;
grant select on public.trades        to authenticated;
grant select on public.chat_messages to authenticated;
grant insert on public.chat_messages to authenticated;
grant update on public.chat_messages to authenticated;
grant select on public.referrals     to authenticated;
