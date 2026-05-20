-- =============================================================================
-- Performance Index — server-only signal that influences athlete pricing.
-- 0–100 scale produced by src/lib/pricing/performance-index.ts.
-- Not shown to end users at MVP (Phase 1).
-- =============================================================================

alter table public.athletes
  add column if not exists performance_index numeric(5,2)
    check (performance_index is null or performance_index between 0 and 100);

create index if not exists idx_athletes_perf_index
  on public.athletes(performance_index desc nulls last)
  where is_active;

-- Convenience: derive base_price from performance_index when the latter
-- is set. Keeps price aligned with the underlying skill signal. The AMM
-- engine in `place_trade()` continues to move `current_price` around this
-- base — only the base anchor changes here.
create or replace function public.derive_base_price(p_index numeric)
returns numeric language sql immutable as $$
  select round(200 + coalesce(p_index, 50) * 4, 2)::numeric
$$;
