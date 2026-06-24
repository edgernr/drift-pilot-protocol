-- ============================================================
-- Void Shards — PRE-TEST SETUP
-- Run ONCE in the Supabase SQL Editor before opening to testers.
-- Idempotent + safe to re-run on an existing project
-- (CREATE ... IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).
--
-- RECOMMENDED RUN ORDER (all in the SQL Editor):
--   1. supabase/pretest_setup.sql      <- THIS FILE (core tables if missing,
--                                          signup trigger, missing columns,
--                                          raid_events, bug_reports, public views)
--   2. eva-react/academy_schema.sql    (child_profiles + academy_completions)
--   3. eva-react/raid_files_table.sql  (raid_files + realtime)
--   4. supabase/security.sql           (RLS policies on the core tables)
--
-- Re-running in this order is harmless.
-- ============================================================


-- ============================================================
-- 1. CORE TABLES (auto-skipped if they already exist)
--    Present so a fresh Supabase project is fully provisioned.
--    Your live project already has these — IF NOT EXISTS makes this a no-op there.
-- ============================================================

create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  name                   text,
  wallet                 text,
  is_admin               boolean default false,
  is_subscribed          boolean default false,
  is_parent              boolean default false,
  is_founder             boolean default false,
  banned_until           timestamptz default null,
  username_color         text default null,   -- Season Pass: custom name colour (brand key, e.g. 'magenta')
  stripe_customer_id     text default null,    -- set by Stripe checkout/webhook functions
  stripe_subscription_id text default null,
  created_at             timestamptz default now()
);

create table if not exists public.quest_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  quest_id     text,
  xp_earned    int,
  time_taken   int,
  paste_count  int default 0,
  flagged      boolean default false,
  chain_minted boolean default false,         -- set true by mint-drift after on-chain mint
  completed_at timestamptz default now(),
  unique (user_id, quest_id)
);

create table if not exists public.gate_unlocks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  quest_id     text,
  drift_cost   int,
  chain_burned boolean default false,          -- set true by burn-drift after on-chain burn
  unlocked_at  timestamptz default now(),
  unique (user_id, quest_id)
);

-- Skill-tree metadata (Dashboard reads from('quests').eq('world',1).order('order_index'))
create table if not exists public.quests (
  id          text primary key,
  world       smallint,
  chapter     smallint,
  title       text,
  topic       text,
  xp          int,
  icon        text,
  is_boss     boolean default false,
  order_index smallint
);
alter table public.quests enable row level security;
drop policy if exists "quests_public_read" on public.quests;
create policy "quests_public_read" on public.quests for select using (true);

create table if not exists public.raids (
  id               uuid primary key default gen_random_uuid(),
  name             text,
  status           text default 'lobby',
  health           int default 1000,
  current_wave     smallint default 0,
  started_at       timestamptz,
  siege_started_at timestamptz,
  ended_at         timestamptz,
  created_by       uuid references auth.users(id),
  created_at       timestamptz default now()
);

create table if not exists public.raid_members (
  id      uuid primary key default gen_random_uuid(),
  raid_id uuid references public.raids(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role    text,
  unique (raid_id, user_id),
  unique (raid_id, role)
);

create table if not exists public.raid_events (
  id           uuid primary key default gen_random_uuid(),
  raid_id      uuid references public.raids(id) on delete cascade,
  type         text,
  label        text,
  health_delta int default 0,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);

-- Defensive column adds (in case older tables predate these)
alter table public.profiles add column if not exists is_subscribed          boolean default false;
alter table public.profiles add column if not exists is_parent              boolean default false;
alter table public.profiles add column if not exists is_founder             boolean default false;
alter table public.profiles add column if not exists banned_until           timestamptz default null;
alter table public.profiles add column if not exists username_color         text default null;
alter table public.profiles add column if not exists stripe_customer_id     text default null;
alter table public.profiles add column if not exists stripe_subscription_id text default null;
alter table public.quest_completions add column if not exists chain_minted boolean default false;
alter table public.gate_unlocks      add column if not exists chain_burned boolean default false;


-- ============================================================
-- 2. SIGNUP TRIGGER — auto-create a profile row for every new user
--    CREATE OR REPLACE is safe even if a trigger already exists.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, wallet)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'wallet'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 3. raid_events RLS  (member event inserts: pledge / sync / wave / bonus)
--    security.sql covers raids + raid_members but NOT raid_events.
-- ============================================================

alter table public.raid_events enable row level security;

drop policy if exists "re_select_all" on public.raid_events;
create policy "re_select_all" on public.raid_events
  for select using (true);

drop policy if exists "re_insert_member" on public.raid_events;
create policy "re_insert_member" on public.raid_events
  for insert with check (
    exists (
      select 1 from public.raid_members m
      where m.raid_id = raid_events.raid_id
        and m.user_id = auth.uid()
    )
    -- admin solo / force actions still work even if membership lookup is racing
    or public.is_current_user_admin()
  );


-- ============================================================
-- 4. bug_reports  (the "Report a Bug" button in Dashboard + AcademyDashboard)
-- ============================================================

create table if not exists public.bug_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  view        text,
  url         text,
  user_agent  text,
  status      text default 'new',
  created_at  timestamptz default now()
);

alter table public.bug_reports enable row level security;

drop policy if exists "br_insert_own" on public.bug_reports;
create policy "br_insert_own" on public.bug_reports
  for insert with check (auth.uid() = user_id);

drop policy if exists "br_select_own" on public.bug_reports;
create policy "br_select_own" on public.bug_reports
  for select using (auth.uid() = user_id);

drop policy if exists "br_admin_all" on public.bug_reports;
create policy "br_admin_all" on public.bug_reports
  for all using (public.is_current_user_admin());


-- ============================================================
-- 5. PUBLIC READ VIEWS (privacy-safe)
--    quest_completions RLS is owner-only, which (correctly) blocks cross-user
--    reads — but that breaks the leaderboard, the public Landing stats, and
--    shared /pilot/:id profiles. These views run with definer rights and expose
--    ONLY non-sensitive columns (NO time_taken / paste_count / flagged), so the
--    anti-cheat signals stay private while public pages still work.
-- ============================================================

-- 5a. Per-pilot leaderboard (Dashboard leaderboard + global rank)
create or replace view public.leaderboard as
  select
    p.id,
    coalesce(p.name, 'Seeker') as name,
    coalesce(sum(qc.xp_earned) filter (where qc.quest_id not like '%:bank'), 0)::bigint as total_xp
  from public.profiles p
  left join public.quest_completions qc on qc.user_id = p.id
  group by p.id, p.name;

alter view public.leaderboard set (security_invoker = off);
grant select on public.leaderboard to anon, authenticated;

-- 5b. Platform-wide aggregate stats (public Landing hero)
create or replace view public.platform_stats as
  select
    (select count(*) from public.profiles)                                              as pilots,
    coalesce((select sum(xp_earned) from public.quest_completions
              where quest_id like 'act1-ch%'), 0)::bigint                               as total_xp,
    coalesce((select count(*) from public.quest_completions
              where quest_id like 'act1-ch%'), 0)::bigint                               as gates_cleared;

alter view public.platform_stats set (security_invoker = off);
grant select on public.platform_stats to anon, authenticated;

-- 5c. Safe completion rows for shared /pilot/:id profiles (no anti-cheat columns)
create or replace view public.public_completions as
  select user_id, quest_id, xp_earned, completed_at
  from public.quest_completions;

alter view public.public_completions set (security_invoker = off);
grant select on public.public_completions to anon, authenticated;


-- ============================================================
-- DONE. Now run academy_schema.sql, raid_files_table.sql, and security.sql.
--
-- OPTIONAL HARDENING (post-test, review before applying):
--   * Tighten raid_files write policy to raid members only (see raid_files_table.sql).
--   * Decide whether the Academy leaderboard should ever expose children's names
--     (currently kept per-family / private — no SQL needed).
-- ============================================================
