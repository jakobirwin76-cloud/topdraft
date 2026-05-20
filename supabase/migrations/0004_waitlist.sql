-- =============================================================================
-- Waitlist — pre-launch gamified queue.
-- Server-only access via service_role. RLS forced; no client policies.
-- =============================================================================

create extension if not exists "citext";

create table public.waitlist (
  id                    uuid primary key default uuid_generate_v4(),
  email                 citext unique not null,
  position              bigserial not null,
  referral_code         text unique not null
                        default lower(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  referred_by           uuid references public.waitlist(id) on delete set null,
  referrals_count       integer not null default 0,
  email_verified        boolean not null default false,
  promoted_to_app       boolean not null default false,
  source                text,                          -- 'organic', 'tiktok', 'reddit', etc.
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_waitlist_referral_code  on public.waitlist(referral_code);
create index idx_waitlist_referred_by    on public.waitlist(referred_by);
create index idx_waitlist_created_at     on public.waitlist(created_at desc);
create index idx_waitlist_position       on public.waitlist(position);

create trigger waitlist_updated_at before update on public.waitlist
  for each row execute function public.tg_set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS — service-role only. No client policies. All access goes through
-- /api/waitlist/* which validates an HMAC-signed token.
-- -----------------------------------------------------------------------------
alter table public.waitlist enable row level security;
alter table public.waitlist force row level security;
-- Intentionally no GRANTs to anon/authenticated.

-- -----------------------------------------------------------------------------
-- credit_referral(referrer_id) — idempotent referral increment.
-- Called by /api/waitlist/verify once email is confirmed (so a fake email
-- can't farm referrals).
-- -----------------------------------------------------------------------------
create or replace function public.credit_referral(p_referred_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
  v_already  boolean;
begin
  select referred_by, email_verified into v_referrer, v_already
    from public.waitlist where id = p_referred_id;

  if v_referrer is null or v_already is true then
    return;  -- no referrer or already counted
  end if;

  update public.waitlist set referrals_count = referrals_count + 1
    where id = v_referrer;

  update public.waitlist set email_verified = true
    where id = p_referred_id;
end $$;

revoke execute on function public.credit_referral(uuid) from public;
-- service_role only
