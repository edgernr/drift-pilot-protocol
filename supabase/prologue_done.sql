-- Season 01 prologue gating flag.
-- Run this in the Supabase SQL editor. Until it runs, the prologue gating in
-- the app is deliberately inert (new signups skip the prologue).
--
-- New signups default to false → they are routed into the "Zero Hour" prologue
-- (GateRoute + Dashboard/Landing redirects). Existing accounts are backfilled
-- to true so nobody with progress gets yanked into the tutorial.

alter table public.profiles
  add column if not exists prologue_done boolean default false;

-- Backfill: everyone who exists before this migration skips the prologue.
update public.profiles set prologue_done = true where prologue_done is distinct from true;

-- (RLS: the existing profiles_update_own policy already permits a user to
--  update their own row as long as is_admin / banned_until are unchanged,
--  so the client can set prologue_done = true with no policy change.)
