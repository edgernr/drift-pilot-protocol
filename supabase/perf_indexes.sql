-- Performance indexes — run once in the Supabase SQL editor.
--
-- Both of these are on columns the raid screens filter by on every mount and
-- every realtime-triggered reload. Without them Postgres sequentially scans
-- the whole table each time, which is survivable at 5 players and is not at 50.
--
-- 1. raid_members had only `unique (raid_id, role)`, so there was no index
--    leading with user_id — but `.eq('user_id', ...)` runs on every raid init
--    (RaidView.jsx loadActiveRaid, Raid01.jsx init).
create index if not exists idx_raid_members_user
  on raid_members (user_id);

-- 2. raid_events had no index at all, and it grows monotonically with every
--    action taken in every raid ever run. The war-room feed queries it as
--    `.eq('raid_id', X).order('created_at' desc).limit(60)` — a seq scan plus
--    a sort over an ever-growing table.
create index if not exists idx_raid_events_raid_created
  on raid_events (raid_id, created_at desc);

-- Verify:
--   select indexname from pg_indexes
--   where tablename in ('raid_members','raid_events');
