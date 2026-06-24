-- ============================================================
-- VOID ACADEMY — Schema additions
-- Run these in order in the Supabase SQL Editor
-- ============================================================

-- 1. Add flags to existing profiles table
alter table public.profiles
  add column if not exists is_parent  boolean default false,
  add column if not exists is_founder boolean default false;

-- 2. Child profiles (linked to parent auth user — no separate Supabase auth for kids)
create table if not exists public.child_profiles (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references auth.users not null,
  name          text not null,
  age           text not null,   -- '8-10' | '11-13' | '14-16'
  track         text not null,   -- 'scratch' | 'python' | 'javascript'
  start_gate    text not null,   -- 'S-01' | 'P-01' | 'J-01' etc.
  intention     text,            -- 'games' | 'websites' | 'apps' | 'curious'
  avatar_index  smallint default 0,
  created_at    timestamptz default now()
);

-- 3. Academy gate completions per child
create table if not exists public.academy_completions (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid references public.child_profiles on delete cascade not null,
  gate_id      text not null,       -- 'S-01' | 'P-03' etc.
  xp_earned    int not null default 0,
  completed_at timestamptz default now(),
  unique(child_id, gate_id)
);

-- 4. RLS
alter table public.child_profiles    enable row level security;
alter table public.academy_completions enable row level security;

-- Parents can only access their own children
drop policy if exists "parent_child_profiles" on public.child_profiles;
create policy "parent_child_profiles" on public.child_profiles
  for all using (auth.uid() = parent_id);

-- Parents can access completions for their children only
drop policy if exists "parent_academy_completions" on public.academy_completions;
create policy "parent_academy_completions" on public.academy_completions
  for all using (
    exists (
      select 1 from public.child_profiles
      where id = child_id and parent_id = auth.uid()
    )
  );

-- 5. Set first 100 pilots as founders (run after table has rows)
-- update public.profiles
--   set is_founder = true
--   where id in (
--     select id from public.profiles order by created_at asc limit 100
--   );
