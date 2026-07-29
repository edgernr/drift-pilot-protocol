-- ============================================================
-- RAID 01 — THE BROODGATE (playable boss raid) migration
-- Run in the Supabase SQL Editor. Idempotent.
--
-- Reuses the existing raids / raid_members / raid_events / raid_files tables.
-- Broodgate runs live in the same `raids` table but use a distinct status
-- namespace (bg_lobby / bg_active / bg_complete / bg_failed) so the legacy
-- 48-hour raid view (which filters on lobby/descent/active/siege) never sees
-- them — no legacy code changes required.
--
-- New table: raid_heads — shared per-head state for the boss. Boss HP is
-- DERIVED client-side from severed heads (999 − severed × 111), so there are
-- no read-modify-write races on a shared health counter.
-- ============================================================

-- The legacy schema may carry a CHECK constraint limiting raids.status to the
-- 48-hour phase names. The app now uses an extended status set — drop any
-- status CHECK on raids (harmless if none exists).
do $$
declare c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.raids'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if c is not null then
    execute format('alter table public.raids drop constraint %I', c);
  end if;
end $$;

-- ── raid_heads ──────────────────────────────────────────────
create table if not exists public.raid_heads (
  raid_id    uuid not null references public.raids(id) on delete cascade,
  head_id    text not null,
  status     text not null default 'open' check (status in ('open', 'claimed', 'severed')),
  claimed_by uuid references auth.users(id),
  severed_by uuid references auth.users(id),
  severed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (raid_id, head_id)
);

alter table public.raid_heads enable row level security;

-- Readable by any authenticated hunter (lobby cards show head progress).
drop policy if exists raid_heads_select on public.raid_heads;
create policy raid_heads_select on public.raid_heads
  for select to authenticated using (true);

-- Only members of the raid may write head state.
drop policy if exists raid_heads_insert on public.raid_heads;
create policy raid_heads_insert on public.raid_heads
  for insert to authenticated
  with check (exists (
    select 1 from public.raid_members m
    where m.raid_id = raid_heads.raid_id and m.user_id = auth.uid()
  ));

drop policy if exists raid_heads_update on public.raid_heads;
create policy raid_heads_update on public.raid_heads
  for update to authenticated
  using (exists (
    select 1 from public.raid_members m
    where m.raid_id = raid_heads.raid_id and m.user_id = auth.uid()
  ));

-- Severed is final — no client can resurrect a head. Also stamps updated_at.
create or replace function public.raid_heads_guard()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'severed' and new.status <> 'severed' then
    raise exception 'a severed head stays severed';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_raid_heads_guard on public.raid_heads;
create trigger trg_raid_heads_guard
  before update on public.raid_heads
  for each row execute function public.raid_heads_guard();

-- ── Realtime ────────────────────────────────────────────────
do $$
begin
  alter publication supabase_realtime add table public.raid_heads;
exception when duplicate_object then null;
end $$;
