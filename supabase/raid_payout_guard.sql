-- ============================================================
-- FIX 1 — close the unlimited $SHARD/XP mint on Broodgate payouts
-- Run in the Supabase SQL Editor. Idempotent (drop + create).
--
-- THE HOLE
-- A Broodgate payout is a quest_completions row the BROWSER inserts. The only
-- permissive guard is qc_insert_own (security.sql:47-49) = "the row is yours".
-- The RESTRICTIVE guard qc_bank_requires_membership (security.sql:58-71) only
-- matches quest_id LIKE 'raid:%:bank'; Broodgate rows are 'raid:<uuid>:f1'…':f5',
-- so they fall through its ELSE true.
--
-- Result today: any authenticated user can insert
--     { quest_id: 'raid:<any-uuid>:f5', xp_earned: 350 }
-- for +350 XP and +1650 $SHARD, repeatable forever with a fresh uuid each time
-- (unique(user_id, quest_id) only stops the SAME id twice; xp_reasonable caps a
-- single row at 10000, not the number of rows).
--
-- THE FIX
-- A second RESTRICTIVE policy covering the ':fN' shape. RESTRICTIVE means it
-- must ALSO pass, on top of qc_insert_own — it cannot widen anything, only
-- narrow. To insert a Broodgate payout you must now:
--   1. be a member of that exact raid, and
--   2. have that exact function actually marked severed in raid_heads.
--
-- WHY IT CANNOT BREAK LEGITIMATE PAYOUTS
-- The client only claims a tier after the function's raid_heads row reads
-- 'severed' (Raid01.jsx fnDone → claim), and only when it finds itself in
-- members. Both conditions are therefore already true at claim time. Verified
-- against the emitted keys: raid:<uuid>:f1..f5 all match the pattern, while
-- 'raid:<uuid>', 'raid:<uuid>:bank' and gate ids ('act1-ch01') do NOT — so
-- gates and the legacy 48-hour raid are untouched.
--
-- SCOPE / HONESTY
-- This does NOT make completion server-authoritative. raid_heads is still
-- written by the client, so a paid-up party member could still mark functions
-- severed without doing the work. That is the NEXT fix (raid_heads INSERT
-- guard). What this closes is the free, unbounded case: no raid, no party,
-- no entry fee, infinite repeats.
-- ============================================================

drop policy if exists "qc_raid_requires_membership_and_completion" on public.quest_completions;

create policy "qc_raid_requires_membership_and_completion"
  on public.quest_completions
  as restrictive
  for insert
  with check (
    case
      -- 'raid:<uuid>:fN' — a Broodgate per-function payout
      when quest_id ~ '^raid:[0-9a-fA-F-]{36}:f[1-5]$' then
        exists (
          select 1 from public.raid_members m
          where m.user_id = auth.uid()
            and m.raid_id::text = split_part(quest_id, ':', 2)
        )
        and exists (
          select 1 from public.raid_heads h
          where h.raid_id::text = split_part(quest_id, ':', 2)
            and h.head_id      = split_part(quest_id, ':', 3)
            and h.status       = 'severed'
        )
      else true
    end
  );

-- ── VERIFY ──────────────────────────────────────────────────
-- 1. The policy exists and is RESTRICTIVE:
--      select polname, polpermissive from pg_policy
--      where polrelid = 'public.quest_completions'::regclass;
--    (polpermissive = false for this one)
--
-- 2. As any signed-in account, the exploit must now FAIL:
--      insert into public.quest_completions (user_id, quest_id, xp_earned)
--      values (auth.uid(), 'raid:00000000-0000-0000-0000-000000000000:f5', 350);
--    -> expected: new row violates row-level security policy
--
-- 3. Gate rewards must still work (regression check): clear any gate in the app
--    and confirm XP/$SHARD still land.

-- ── ROLLBACK (if it ever blocks a legitimate payout) ────────
-- drop policy if exists "qc_raid_requires_membership_and_completion" on public.quest_completions;
