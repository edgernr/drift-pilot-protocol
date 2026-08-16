-- ============================================================
-- ADMIN ROSTER — server-enforced access to the sensitive profile columns
-- Run in the Supabase SQL Editor. PURELY ADDITIVE: it creates one function and
-- grants execute. It does not revoke anything, does not touch RLS, and cannot
-- break the app — the admin screen keeps working before and after.
--
-- WHY: ASSOCIATION COMMAND reads normalized_email, dupe_flag, ban/suspend
-- reasons straight off public.profiles, gated only by `if (!isAdmin) return`
-- in React. Client-side gating is decoration — any signed-in user can issue
-- the same query and pull every email on the platform.
--
-- This is also step 1 of closing the profiles exposure: once the admin screen
-- goes through here, NOTHING in the app needs to read another user's row in
-- profiles, and the read policy can be tightened to own-row without blanking
-- any screen.
-- ============================================================

create or replace function public.admin_list_pilots()
returns table (
  id               uuid,
  name             text,
  is_subscribed    boolean,
  is_admin         boolean,
  banned_until     timestamptz,
  suspended_until  timestamptz,
  suspend_reason   text,
  prologue_done    boolean,
  dupe_flag        boolean,
  normalized_email text,
  created_at       timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The gate that actually matters: enforced by the database, not the browser.
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ) then
    raise exception 'not authorized';
  end if;

  return query
    select p.id, p.name, p.is_subscribed, p.is_admin, p.banned_until,
           p.suspended_until, p.suspend_reason, p.prologue_done,
           p.dupe_flag, p.normalized_email, p.created_at
    from public.profiles p
    order by p.name;
end;
$$;

revoke all on function public.admin_list_pilots() from public, anon;
grant execute on function public.admin_list_pilots() to authenticated;

-- ── VERIFY ──────────────────────────────────────────────────
-- As an admin account:      select count(*) from public.admin_list_pilots();
-- As a non-admin account:   should raise "not authorized"
