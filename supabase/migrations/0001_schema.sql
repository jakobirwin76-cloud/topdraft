-- =============================================================================
-- AthleteX schema — initial migration
-- Apply via Supabase Studio → SQL Editor, or `supabase db push` if using CLI.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type sport as enum ('NFL', 'SOCCER', 'NBA', 'MLB', 'NHL');
create type trade_side as enum ('buy', 'sell');
create type trade_status as enum ('pending', 'filled', 'rolled_back');

-- -----------------------------------------------------------------------------
-- Profiles  (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  display_name      text not null check (char_length(display_name) between 2 and 32),
  avatar_url        text,
  date_of_birth     date not null,
  state_code        text not null check (char_length(state_code) = 2),
  country_code      text not null default 'US' check (char_length(country_code) = 2),
  phone_e164        text,
  mfa_enrolled      boolean not null default false,
  is_age_verified   boolean not null default false,
  is_geofence_ok    boolean not null default true,
  virtual_balance   numeric(18,2) not null default 10000.00 check (virtual_balance >= 0),
  referral_code     text unique not null default lower(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  referred_by       uuid references public.profiles(user_id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Hard age gate (18+) enforced at the DB level so it survives any client bug.
  constraint chk_min_age check (date_of_birth <= (current_date - interval '18 years'))
);
create index idx_profiles_referral_code on public.profiles(referral_code);
create index idx_profiles_referred_by on public.profiles(referred_by);

-- -----------------------------------------------------------------------------
-- Athletes (public catalog)
-- -----------------------------------------------------------------------------
create table public.athletes (
  id              uuid primary key default uuid_generate_v4(),
  external_id     text unique not null,                 -- SportsRadar ID
  sport           sport not null,
  full_name       text not null,
  team_code       text,                                  -- factual reference only, no logos
  position        text,
  base_price      numeric(12,2) not null check (base_price > 0),
  current_price   numeric(12,2) not null check (current_price > 0),
  is_active       boolean not null default true,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_athletes_sport on public.athletes(sport) where is_active;
create index idx_athletes_external_id on public.athletes(external_id);

-- -----------------------------------------------------------------------------
-- Holdings (user portfolio)
-- -----------------------------------------------------------------------------
create table public.holdings (
  user_id         uuid not null references public.profiles(user_id) on delete cascade,
  athlete_id      uuid not null references public.athletes(id) on delete restrict,
  shares          numeric(18,4) not null default 0 check (shares >= 0),
  avg_cost        numeric(12,4) not null default 0 check (avg_cost >= 0),
  updated_at      timestamptz not null default now(),
  primary key (user_id, athlete_id)
);
create index idx_holdings_user on public.holdings(user_id);

-- -----------------------------------------------------------------------------
-- Trades (immutable ledger)
-- -----------------------------------------------------------------------------
create table public.trades (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(user_id) on delete cascade,
  athlete_id      uuid not null references public.athletes(id) on delete restrict,
  side            trade_side not null,
  shares          numeric(18,4) not null check (shares > 0),
  price           numeric(12,4) not null check (price > 0),
  total_cost      numeric(18,4) not null check (total_cost > 0),
  status          trade_status not null default 'filled',
  rolled_back_at  timestamptz,
  rollback_reason text,
  created_at      timestamptz not null default now()
);
create index idx_trades_user_created on public.trades(user_id, created_at desc);
create index idx_trades_athlete_created on public.trades(athlete_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Price history (read-only, append-only)
-- -----------------------------------------------------------------------------
create table public.price_history (
  athlete_id      uuid not null references public.athletes(id) on delete cascade,
  price           numeric(12,4) not null,
  source          text not null check (source in ('amm', 'stat_event', 'admin', 'decay', 'rollback')),
  event_id        text,
  created_at      timestamptz not null default now(),
  primary key (athlete_id, created_at)
);

-- -----------------------------------------------------------------------------
-- Stat events (raw SportsRadar feed, audit trail)
-- -----------------------------------------------------------------------------
create table public.stat_events (
  id              uuid primary key default uuid_generate_v4(),
  external_event_id text unique not null,        -- dedup key
  athlete_id      uuid references public.athletes(id),
  sport           sport not null,
  event_type      text not null,                 -- 'TD', 'INT', 'GOAL', 'INJURY', etc.
  payload         jsonb not null,
  applied_at      timestamptz,                   -- null until pricing engine consumes
  created_at      timestamptz not null default now()
);
create index idx_stat_events_unapplied on public.stat_events(created_at) where applied_at is null;

-- -----------------------------------------------------------------------------
-- Athlete chat rooms (Sleeper-style social)
-- -----------------------------------------------------------------------------
create table public.chat_messages (
  id              uuid primary key default uuid_generate_v4(),
  athlete_id      uuid not null references public.athletes(id) on delete cascade,
  user_id         uuid not null references public.profiles(user_id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 500),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index idx_chat_athlete_created on public.chat_messages(athlete_id, created_at desc) where deleted_at is null;

-- -----------------------------------------------------------------------------
-- Referrals (one row per credit event)
-- -----------------------------------------------------------------------------
create table public.referrals (
  id              uuid primary key default uuid_generate_v4(),
  referrer_id     uuid not null references public.profiles(user_id) on delete cascade,
  referred_id     uuid not null references public.profiles(user_id) on delete cascade,
  amount          numeric(12,2) not null check (amount > 0),
  paid_out_at     timestamptz,                   -- 48h hold
  created_at      timestamptz not null default now(),
  unique (referrer_id, referred_id)
);

-- -----------------------------------------------------------------------------
-- Audit log (security & compliance)
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id              bigserial primary key,
  user_id         uuid references public.profiles(user_id) on delete set null,
  action          text not null,
  resource        text,
  ip_address      inet,
  user_agent      text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);
create index idx_audit_user_created on public.audit_logs(user_id, created_at desc);
create index idx_audit_action_created on public.audit_logs(action, created_at desc);

-- -----------------------------------------------------------------------------
-- Updated-at trigger helper
-- -----------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger athletes_updated_at before update on public.athletes
  for each row execute function public.tg_set_updated_at();
create trigger holdings_updated_at before update on public.holdings
  for each row execute function public.tg_set_updated_at();
