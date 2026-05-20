-- =============================================================================
-- Server-side functions
--   - place_trade()    : atomic trade execution with row-level lock
--   - apply_stat_event(): pricing engine state transition (server only)
-- All functions run as SECURITY DEFINER so they can update tables that the
-- caller has no direct UPDATE rights on. They re-validate auth.uid() to make
-- sure a user can't trade on behalf of another user.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- place_trade(athlete_id, side, shares)
--
-- Returns: trade row.
-- Errors:  insufficient_balance | insufficient_shares | athlete_inactive |
--          rate_limited | unauthorized
-- -----------------------------------------------------------------------------
create or replace function public.place_trade(
  p_athlete_id  uuid,
  p_side        trade_side,
  p_shares      numeric
) returns public.trades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user        uuid := auth.uid();
  v_athlete     public.athletes;
  v_holding     public.holdings;
  v_balance     numeric(18,2);
  v_total       numeric(18,4);
  v_new_price   numeric(12,4);
  v_trade       public.trades;
begin
  if v_user is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  if p_shares is null or p_shares <= 0 then
    raise exception 'invalid_shares' using errcode = '22023';
  end if;

  -- Lock the athlete row so concurrent trades serialize on price.
  select * into v_athlete from public.athletes
    where id = p_athlete_id and is_active
    for update;
  if not found then
    raise exception 'athlete_inactive' using errcode = '22023';
  end if;

  -- Lock the user's profile to serialize on balance.
  select virtual_balance into v_balance from public.profiles
    where user_id = v_user
    for update;

  v_total := round(p_shares * v_athlete.current_price, 4);

  if p_side = 'buy' then
    if v_balance < v_total then
      raise exception 'insufficient_balance' using errcode = '22023';
    end if;

    update public.profiles set virtual_balance = virtual_balance - v_total
      where user_id = v_user;

    insert into public.holdings (user_id, athlete_id, shares, avg_cost)
      values (v_user, p_athlete_id, p_shares, v_athlete.current_price)
    on conflict (user_id, athlete_id) do update
      set shares   = public.holdings.shares + excluded.shares,
          avg_cost = ((public.holdings.shares * public.holdings.avg_cost) +
                      (excluded.shares * excluded.avg_cost)) /
                     (public.holdings.shares + excluded.shares);

  else  -- sell
    select * into v_holding from public.holdings
      where user_id = v_user and athlete_id = p_athlete_id
      for update;
    if not found or v_holding.shares < p_shares then
      raise exception 'insufficient_shares' using errcode = '22023';
    end if;

    update public.profiles set virtual_balance = virtual_balance + v_total
      where user_id = v_user;

    update public.holdings set shares = shares - p_shares
      where user_id = v_user and athlete_id = p_athlete_id;
  end if;

  -- AMM price impact: 0.4% per share moved, capped to ±2% per single trade
  -- so a whale can't crash the price in one transaction.
  v_new_price := greatest(
    v_athlete.base_price * 0.10,                 -- floor at 10% of base
    case when p_side = 'buy'
      then v_athlete.current_price * least(1.02, 1 + (p_shares / 1000.0) * 0.004)
      else v_athlete.current_price * greatest(0.98, 1 - (p_shares / 1000.0) * 0.004)
    end
  );

  update public.athletes set current_price = round(v_new_price, 4)
    where id = p_athlete_id;

  insert into public.price_history (athlete_id, price, source)
    values (p_athlete_id, v_new_price, 'amm');

  insert into public.trades (user_id, athlete_id, side, shares, price, total_cost)
    values (v_user, p_athlete_id, p_side, p_shares, v_athlete.current_price, v_total)
    returning * into v_trade;

  insert into public.audit_logs (user_id, action, resource, metadata)
    values (v_user, 'trade.' || p_side, 'athlete:' || p_athlete_id::text,
            jsonb_build_object('trade_id', v_trade.id, 'shares', p_shares, 'price', v_athlete.current_price));

  return v_trade;
end $$;

revoke execute on function public.place_trade(uuid, trade_side, numeric) from public;
grant  execute on function public.place_trade(uuid, trade_side, numeric) to authenticated;

-- -----------------------------------------------------------------------------
-- apply_stat_event(external_event_id, athlete_id, multiplier)
-- Server-only (called by webhook handler with service_role).
-- Idempotent on external_event_id.
-- -----------------------------------------------------------------------------
create or replace function public.apply_stat_event(
  p_event_id    text,
  p_athlete_id  uuid,
  p_multiplier  numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_already boolean;
  v_new_price numeric(12,4);
begin
  -- Idempotency
  select applied_at is not null into v_already from public.stat_events
    where external_event_id = p_event_id;
  if v_already is true then
    return;
  end if;

  update public.athletes
    set current_price = round(current_price * p_multiplier, 4)
    where id = p_athlete_id and is_active
    returning current_price into v_new_price;

  if v_new_price is null then
    return;  -- inactive or missing athlete
  end if;

  insert into public.price_history (athlete_id, price, source, event_id)
    values (p_athlete_id, v_new_price, 'stat_event', p_event_id);

  update public.stat_events set applied_at = now()
    where external_event_id = p_event_id;
end $$;

revoke execute on function public.apply_stat_event(text, uuid, numeric) from public;
-- Service role only: no GRANT to authenticated.
