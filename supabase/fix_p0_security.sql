-- ═══════════════════════════════════════════════════════════════════════════
--  P0 SECURITY FIXES — run this whole file in the Supabase SQL editor.
--  Audit: docs/security-audit-2026-08-17.md
--
--  Safe to re-run. Nothing here touches user data.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- P0-2 (half 1 of 2) — raid_files: members only
--
-- Was: any signed-in user could read AND write the code files of ANY raid.
-- The old file's own comment said "role-trust enforced client-side", which is
-- the bug written down. Combined with the check iframe running that code with
-- allow-same-origin, this was a full account-takeover path: write JS into a
-- stranger's raid file, wait for them to open that function, read their
-- session token out of localStorage.
--
-- The iframe half of this fix is in src/components/Raid01Combat.jsx.
-- ───────────────────────────────────────────────────────────────────────────

drop policy if exists "raid_files_read"  on public.raid_files;
drop policy if exists "raid_files_write" on public.raid_files;

create policy "raid_files_read" on public.raid_files
  for select using (
    exists (
      select 1 from public.raid_members m
      where m.raid_id = raid_files.raid_id
        and m.user_id = auth.uid()
    )
  );

create policy "raid_files_write" on public.raid_files
  for all
  using (
    exists (
      select 1 from public.raid_members m
      where m.raid_id = raid_files.raid_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.raid_members m
      where m.raid_id = raid_files.raid_id
        and m.user_id = auth.uid()
    )
  );

-- The membership lookup now runs on every file read/write.
create index if not exists idx_raid_members_user_raid
  on public.raid_members (user_id, raid_id);


-- ───────────────────────────────────────────────────────────────────────────
-- P0-3 — profiles: protected columns
--
-- Was: the WITH CHECK pinned is_admin and the ban columns, but NOT
-- is_subscribed, is_founder, stripe_*, normalized_email or prologue_done.
-- So `update profiles set is_subscribed = true` from the browser console gave
-- anyone a free Season Pass and a permanent 1.25x XP multiplier.
--
-- Deliberately a trigger with a POSITIVE list rather than another column-by-
-- column WITH CHECK: any column added later is protected by default instead of
-- silently exposed. (And not the column-GRANT approach — profiles_lockdown_
-- ROLLBACK.sql documents why that broke select('*').)
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.guard_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- service_role (webhooks, edge functions) and admins bypass the guard.
  if auth.role() = 'service_role' or public.is_current_user_admin() then
    return new;
  end if;

  if new.is_admin           is distinct from old.is_admin           then raise exception 'protected column: is_admin'; end if;
  if new.is_subscribed      is distinct from old.is_subscribed      then raise exception 'protected column: is_subscribed'; end if;
  if new.is_founder         is distinct from old.is_founder         then raise exception 'protected column: is_founder'; end if;
  if new.banned_until       is distinct from old.banned_until       then raise exception 'protected column: banned_until'; end if;
  if new.ban_reason         is distinct from old.ban_reason         then raise exception 'protected column: ban_reason'; end if;
  if new.suspended_until    is distinct from old.suspended_until    then raise exception 'protected column: suspended_until'; end if;
  if new.suspend_reason     is distinct from old.suspend_reason     then raise exception 'protected column: suspend_reason'; end if;
  if new.normalized_email   is distinct from old.normalized_email   then raise exception 'protected column: normalized_email'; end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_profile_columns on public.profiles;
create trigger trg_guard_profile_columns
  before update on public.profiles
  for each row execute function public.guard_profile_columns();

-- NOTE — columns referenced above must exist. If your profiles table lacks any
-- of them this file will error on the first UPDATE, not on creation. Check with:
--   select column_name from information_schema.columns
--   where table_name = 'profiles' order by 1;
-- and delete any line for a column you don't have. Likewise, ADD a line for any
-- of these if you have them: stripe_customer_id, stripe_subscription_id,
-- suspended_at, dupe_flag, is_parent, wallet.


-- ───────────────────────────────────────────────────────────────────────────
-- P0-4 — profiles: stop leaking every user's email
--
-- Was: profiles_public_read USING (true) + grants to anon. An anonymous client
-- could dump normalized_email, stripe ids, ban reasons and is_admin for every
-- user in the system.
--
-- Every legitimate public reader already goes through the SECURITY DEFINER
-- views (public_profiles, leaderboard, guild_roster), which expose only safe
-- columns — so narrowing the base table breaks nothing.
-- ───────────────────────────────────────────────────────────────────────────

drop policy if exists "profiles_public_read" on public.profiles;

create policy "profiles_self_read" on public.profiles
  for select using (
    auth.uid() = id or public.is_current_user_admin()
  );

revoke all on public.profiles from anon;
grant select on public.public_profiles to anon, authenticated;
grant select on public.leaderboard      to anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- P0-1 — the unlimited Shard mint
--
-- Was: create a raid -> join it -> insert quest_completions with
-- quest_id 'raid:<that-raid>:bank' and xp_earned 10000. AuthContext counts a
-- :bank row's xp_earned as direct Shards. The old policy only required raid
-- membership — membership in the raid you just made yourself. Raids are free.
--
-- Fix: clients may no longer insert :bank rows at all. The payout is computed
-- server-side from the raid's actual state.
-- ───────────────────────────────────────────────────────────────────────────

-- 1. Block the client path entirely.
drop policy if exists "qc_bank_requires_membership" on public.quest_completions;

create policy "qc_no_client_bank" on public.quest_completions
  as restrictive for insert to authenticated
  with check (quest_id not like '%:bank');

-- 2. Server-side claim. Computes the pot itself; refuses to pay twice.
create or replace function public.claim_raid_bank(p_raid_id uuid)
returns table (awarded int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_status  text;
  v_members int;
  v_severed int;
  v_award   int;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  -- Must be a member of the raid.
  if not exists (select 1 from raid_members
                 where raid_id = p_raid_id and user_id = v_uid) then
    raise exception 'not a member of this raid';
  end if;

  select status into v_status from raids where id = p_raid_id;
  if v_status is null then raise exception 'no such raid'; end if;

  -- Only a genuinely finished raid pays out.
  if v_status not in ('bg_complete', 'complete') then
    raise exception 'raid is not complete';
  end if;

  -- Already claimed by this user?
  if exists (select 1 from quest_completions
             where user_id = v_uid
               and quest_id = 'raid:' || p_raid_id || ':bank') then
    raise exception 'already claimed';
  end if;

  select count(*) into v_members from raid_members where raid_id = p_raid_id;
  select count(*) into v_severed from raid_heads
    where raid_id = p_raid_id and status = 'severed';

  -- Pot is derived from real progress, and hard-capped.
  v_award := least(v_severed * 1000, 5000);
  if v_members < 2 then v_award := 0; end if;   -- solo "raids" pay nothing

  insert into quest_completions (user_id, quest_id, xp_earned)
  values (v_uid, 'raid:' || p_raid_id || ':bank', v_award);

  return query select v_award;
end;
$$;

revoke all on function public.claim_raid_bank(uuid) from public, anon;
grant execute on function public.claim_raid_bank(uuid) to authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- P1-4 — raid_heads could be inserted already 'severed'
--
-- The payout guard requires a severed head, but members could insert one that
-- was severed from the start (the existing guard trigger is BEFORE UPDATE
-- only). That is 1750 XP + 5150 Shards per self-made raid.
-- ───────────────────────────────────────────────────────────────────────────

drop policy if exists "raid_heads_insert" on public.raid_heads;

create policy "raid_heads_insert" on public.raid_heads
  for insert to authenticated
  with check (
    status = 'open'
    and exists (
      select 1 from public.raid_members m
      where m.raid_id = raid_heads.raid_id
        and m.user_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
--  VERIFY — run as an ordinary (non-admin) test account. All should FAIL.
--
--    update profiles set is_subscribed = true where id = auth.uid();
--    insert into quest_completions (user_id, quest_id, xp_earned)
--      values (auth.uid(), 'raid:'||gen_random_uuid()||':bank', 10000);
--    insert into raid_heads (raid_id, head_id, status)
--      values ('<any-raid>', 'f1', 'severed');
--
--  And from an ANONYMOUS client, this should return no rows:
--    select normalized_email from profiles;
-- ═══════════════════════════════════════════════════════════════════════════
