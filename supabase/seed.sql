-- =============================================================================
-- Local dev seed. Run after 0001/0002/0003/0004/0005.
-- DOES NOT seed users — those come through the signup flow.
--
-- Performance Index values are precomputed from
-- src/lib/pricing/performance-index.ts using the typed inputs in
-- src/lib/mocks/athlete-stats.ts. base_price + current_price are derived
-- via the helper in 0005: base_price = round(200 + idx * 4, 2).
-- =============================================================================

insert into public.athletes
  (external_id,        sport,    full_name,           team_code, position, performance_index, base_price, current_price)
values
  -- NFL
  ('sr:nfl:player:1',  'NFL',    'Patrick Mahomes',   'KC',      'QB',     70.7,              482.80,     482.80),
  ('sr:nfl:player:2',  'NFL',    'Travis Kelce',      'KC',      'TE',     34.3,              337.20,     337.20),
  ('sr:nfl:player:3',  'NFL',    'Justin Jefferson',  'MIN',     'WR',     66.2,              464.80,     464.80),
  ('sr:nfl:player:4',  'NFL',    'Lamar Jackson',     'BAL',     'QB',     66.5,              466.00,     466.00),

  -- NBA
  ('sr:nba:player:1',  'NBA',    'LeBron James',      'LAL',     'SF',     61.9,              447.60,     447.60),
  ('sr:nba:player:2',  'NBA',    'Stephen Curry',     'GSW',     'PG',     67.2,              468.80,     468.80),
  ('sr:nba:player:3',  'NBA',    'Nikola Jokić',      'DEN',     'C',      60.7,              442.80,     442.80),
  ('sr:nba:player:4',  'NBA',    'Anthony Edwards',   'MIN',     'SG',     50.1,              400.40,     400.40),

  -- Soccer
  ('sr:soc:player:1',  'SOCCER', 'Erling Haaland',    'MCI',     'FW',     75.6,              502.40,     502.40),
  ('sr:soc:player:2',  'SOCCER', 'Kylian Mbappé',     'RMA',     'FW',     73.6,              494.40,     494.40),
  ('sr:soc:player:3',  'SOCCER', 'Jude Bellingham',   'RMA',     'MF',     64.7,              458.80,     458.80),
  ('sr:soc:player:4',  'SOCCER', 'Vinícius Júnior',   'RMA',     'FW',     39.3,              357.20,     357.20)
on conflict (external_id) do nothing;
