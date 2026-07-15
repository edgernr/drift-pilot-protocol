-- ============================================================
-- Void Shards — ANTI-ABUSE (Session 1: SQL foundation)
--   • Account states: SUSPEND (distinct from BAN) + reasons/audit + void-clear
--   • Unified security_events telemetry (IP + device fingerprint + bot signals)
--   • Multi-account (shared IP / fingerprint) detection views
--   • Burner/disposable email blocklist + gmail-alias normalization + dupe flag
--
-- ⚠  RUN MANUALLY in the Supabase SQL Editor. Idempotent — safe to re-run.
--    ORDER: after pretest_setup.sql (profiles, quest_completions, handle_new_user),
--    after supabase/security.sql (is_current_user_admin, profiles_update_own),
--    and after guilds.sql if you use it (leaderboard view w/ avatar). Order-safe otherwise.
--
-- Design verified by an adversarial feasibility pass (see docs/anti-abuse-design.md).
-- Reconciliations baked in: ONE security_events table, ONE handle_new_user().
--
-- OWNER SESSION-2 (dashboard, cannot be done here) unlocks the hard blocks:
--   • Auth → Hooks → "Before user created" → Postgres → before_user_created_guard
--     (+ the supabase_auth_admin grants below) → disposable BLOCK w/ clean message.
--   • Auth → require email confirmation + rate limits.  • Turnstile captcha.
-- Until then: client-side pre-checks + dupe/burst FLAGGING work immediately.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- PART A — ACCOUNT STATES: SUSPEND vs BAN
-- ════════════════════════════════════════════════════════════

-- Additive columns (fetchProfile uses select('*') → picked up for free).
alter table public.profiles add column if not exists suspended_until timestamptz default null;
alter table public.profiles add column if not exists suspend_reason  text        default null;
alter table public.profiles add column if not exists suspended_at    timestamptz default null;
alter table public.profiles add column if not exists ban_reason      text        default null;
-- Permanent sentinel reuses the ban convention: '2099-01-01T00:00:00Z'.

-- Is the CURRENT user suspended right now? SECURITY DEFINER so a RESTRICTIVE
-- policy can call it without recursing through profiles RLS (mirrors
-- is_current_user_admin()).
create or replace function public.is_current_user_suspended()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and suspended_until is not null
      and suspended_until > now()
  );
$$;

-- Harden self-update: the existing policy pinned only is_admin + banned_until.
-- Extend it so a user cannot self-lift a suspension (or forge audit fields).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    is_admin = (select is_admin from public.profiles where id = auth.uid())
    and banned_until    is not distinct from (select banned_until    from public.profiles where id = auth.uid())
    and suspended_until is not distinct from (select suspended_until from public.profiles where id = auth.uid())
    and suspend_reason  is not distinct from (select suspend_reason  from public.profiles where id = auth.uid())
    and suspended_at    is not distinct from (select suspended_at    from public.profiles where id = auth.uid())
    and ban_reason      is not distinct from (select ban_reason      from public.profiles where id = auth.uid())
  );
-- (profiles_update_admin has USING with no WITH CHECK → admins may still write
--  these columns; no new admin policy needed.)

-- RESTRICTIVE backstop: a suspended user earns NOTHING (blocks reward writes
-- server-side even if the client guard is bypassed). Restrictive = must ALSO pass.
drop policy if exists "qc_block_suspended" on public.quest_completions;
create policy "qc_block_suspended" on public.quest_completions
  as restrictive
  for insert
  with check (not public.is_current_user_suspended());

drop policy if exists "gu_block_suspended" on public.gate_unlocks;
create policy "gu_block_suspended" on public.gate_unlocks
  as restrictive
  for insert
  with check (not public.is_current_user_suspended());

-- VOID-CLEAR needs an admin DELETE policy (security.sql only had qc_update_admin).
-- Deleting a flagged row reverses XP+$SHARD (both are derived from surviving rows).
drop policy if exists "qc_delete_admin" on public.quest_completions;
create policy "qc_delete_admin" on public.quest_completions
  for delete using (public.is_current_user_admin());


-- ════════════════════════════════════════════════════════════
-- PART B — UNIFIED security_events (IP + fingerprint + bot signals)
-- ════════════════════════════════════════════════════════════
-- One superset table (reconciled from the ip-device + bot-detection designs).

create table if not exists public.security_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,  -- null at signup (no session yet)
  kind        text not null,               -- 'signup' | 'login' | 'session' | 'bot'
  ip          inet,                         -- raw IP (admin-only; captured server-side)
  ip_hash     text,                         -- salted HMAC of IP (multi-account joins w/o exposing raw)
  fingerprint text,                         -- client device signature
  email_hash  text,                         -- salted HMAC of normalized email (bot logs, no raw email)
  bot_score   int  default 0,               -- 0..100 client heuristic score
  signals     jsonb default '{}'::jsonb,    -- {honeypot, ms_to_submit, interactions, ...}
  user_agent  text,
  created_at  timestamptz default now()
);
create index if not exists idx_secev_ip_hash     on public.security_events (ip_hash);
create index if not exists idx_secev_fingerprint on public.security_events (fingerprint);
create index if not exists idx_secev_user        on public.security_events (user_id);
create index if not exists idx_secev_created      on public.security_events (created_at desc);

alter table public.security_events enable row level security;
-- Admin-only read (raw IP + signals are sensitive).
drop policy if exists "secev_select_admin" on public.security_events;
create policy "secev_select_admin" on public.security_events
  for select using (public.is_current_user_admin());
-- Anyone (incl. anon at signup) may INSERT via the RPC below; bot_score bounded.
drop policy if exists "secev_insert_any" on public.security_events;
create policy "secev_insert_any" on public.security_events
  for insert with check (bot_score between 0 and 100);

-- Salt for hashing IP/email. Overwrite the default with your own random value
-- once (keep it secret). Stored in a 1-row config table so the RPC can read it.
create table if not exists public.security_config (
  id   int primary key default 1,
  salt text not null default encode(gen_random_bytes(16), 'hex'),
  constraint security_config_singleton check (id = 1)
);
insert into public.security_config (id) values (1) on conflict (id) do nothing;

-- Capture RPC — SECURITY DEFINER, reads the client IP from the PostgREST request
-- context (x-forwarded-for; the gateway prepends the real edge IP as element 1).
-- Works for anon + authed calls. Writes one telemetry row.
create or replace function public.log_security_event(
  p_kind        text,
  p_fingerprint text default null,
  p_email       text default null,
  p_bot_score   int  default 0,
  p_signals     jsonb default '{}'::jsonb,
  p_user_agent  text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xff  text;
  v_ip   inet;
  v_salt text;
begin
  select salt into v_salt from public.security_config where id = 1;
  begin
    v_xff := current_setting('request.headers', true)::json ->> 'x-forwarded-for';
  exception when others then v_xff := null;
  end;
  begin
    v_ip := split_part(coalesce(v_xff, ''), ',', 1)::inet;
  exception when others then v_ip := null;
  end;

  insert into public.security_events
    (user_id, kind, ip, ip_hash, fingerprint, email_hash, bot_score, signals, user_agent)
  values (
    auth.uid(),
    coalesce(p_kind, 'session'),
    v_ip,
    case when v_ip is null then null else encode(hmac(host(v_ip), v_salt, 'sha256'), 'hex') end,
    p_fingerprint,
    case when p_email is null or p_email = '' then null
         else encode(hmac(lower(p_email), v_salt, 'sha256'), 'hex') end,
    greatest(0, least(100, coalesce(p_bot_score, 0))),
    coalesce(p_signals, '{}'::jsonb),
    p_user_agent
  );
end;
$$;
grant execute on function public.log_security_event(text, text, text, int, jsonb, text) to anon, authenticated;

-- ── Multi-account detection views (admin-only via security_invoker) ──────────
-- Distinct accounts that have shared an IP (last 30 days).
drop view if exists public.account_links_ip;
create view public.account_links_ip
  with (security_invoker = on) as
  select ip_hash,
         count(distinct user_id)                          as account_count,
         array_agg(distinct user_id)                      as user_ids,
         max(created_at)                                  as last_seen
  from public.security_events
  where ip_hash is not null and user_id is not null
    and created_at > now() - interval '30 days'
  group by ip_hash
  having count(distinct user_id) > 1;

-- Distinct accounts that have shared a device fingerprint (last 30 days).
drop view if exists public.account_links_fp;
create view public.account_links_fp
  with (security_invoker = on) as
  select fingerprint,
         count(distinct user_id)                          as account_count,
         array_agg(distinct user_id)                      as user_ids,
         max(created_at)                                  as last_seen
  from public.security_events
  where fingerprint is not null and user_id is not null
    and created_at > now() - interval '30 days'
  group by fingerprint
  having count(distinct user_id) > 1;


-- ════════════════════════════════════════════════════════════
-- PART C — BURNER / DISPOSABLE EMAIL + GMAIL-ALIAS NORMALIZATION
-- ════════════════════════════════════════════════════════════

-- Admin-extensible disposable-domain blocklist (seed = common offenders;
-- import a big public list later if you want).
create table if not exists public.domain_blocklist (
  domain     text primary key,
  added_by   uuid references auth.users(id) on delete set null,
  added_at   timestamptz default now()
);
alter table public.domain_blocklist enable row level security;
drop policy if exists "dbl_read_all"   on public.domain_blocklist;
create policy "dbl_read_all"   on public.domain_blocklist for select using (true);
drop policy if exists "dbl_write_admin" on public.domain_blocklist;
create policy "dbl_write_admin" on public.domain_blocklist
  for all using (public.is_current_user_admin()) with check (public.is_current_user_admin());

insert into public.domain_blocklist (domain) values
  ('mailinator.com'),('guerrillamail.com'),('guerrillamail.info'),('grr.la'),
  ('10minutemail.com'),('10minutemail.net'),('tempmail.com'),('temp-mail.org'),
  ('tempmail.net'),('tempmailo.com'),('yopmail.com'),('yopmail.net'),
  ('trashmail.com'),('trashmail.net'),('sharklasers.com'),('getnada.com'),
  ('dispostable.com'),('maildrop.cc'),('mailnesia.com'),('mohmal.com'),
  ('fakeinbox.com'),('throwawaymail.com'),('emailondeck.com'),('mintemail.com'),
  ('spamgourmet.com'),('mailcatch.com'),('inboxbear.com'),('tempinbox.com'),
  ('burnermail.io'),('33mail.com'),('anonaddy.com'),('spam4.me'),
  ('temp-mail.io'),('minuteinbox.com'),('mailsac.com'),('vomoto.com'),
  ('discard.email'),('emltmp.com'),('luxusmail.org'),('mvrht.net'),
  ('mytemp.email'),('tmpmail.org'),('tmpmail.net'),('moakt.com'),
  ('easytrashmail.com'),('gettempmail.com')
on conflict (domain) do nothing;

-- Anon-readable sanitized view (client pre-check reads this, not the base table).
drop view if exists public.blocked_domains;
create view public.blocked_domains
  with (security_invoker = on) as
  select domain from public.domain_blocklist;
grant select on public.blocked_domains to anon, authenticated;

-- Normalize an email for duplicate detection: lowercase, and for gmail/googlemail
-- strip dots + a +tag from the local part (u.s.e.r+x@gmail == user@gmail).
create or replace function public.normalize_email(p_email text)
returns text
language plpgsql
immutable
as $$
declare
  local  text;
  domain text;
begin
  if p_email is null or position('@' in p_email) = 0 then return lower(coalesce(p_email,'')); end if;
  local  := lower(split_part(p_email, '@', 1));
  domain := lower(split_part(p_email, '@', 2));
  local  := split_part(local, '+', 1);                 -- drop +tag
  if domain in ('gmail.com','googlemail.com') then
    local  := replace(local, '.', '');                  -- gmail ignores dots
    domain := 'gmail.com';
  end if;
  return local || '@' || domain;
end;
$$;

-- Store the normalized email + a duplicate flag on profiles.
alter table public.profiles add column if not exists normalized_email text default null;
alter table public.profiles add column if not exists dupe_flag        boolean default false;
create index if not exists idx_profiles_normalized_email on public.profiles (normalized_email);
-- NB: deliberately NOT unique — a unique-violation would surface as a generic
-- 500 and block legit re-signups with no explanation. We FLAG instead.


-- ════════════════════════════════════════════════════════════
-- PART D — MERGED handle_new_user()  (reconciliation R2)
-- ════════════════════════════════════════════════════════════
-- ONE definition = original profile insert + email normalization + dupe flag +
-- a per-domain signup burst guard. NO global counter (would throttle legit
-- launch traffic with an opaque 500). NO disposable BLOCK here (blocking with a
-- clean message belongs in the Session-2 "Before user created" hook; the IP GUC
-- is also empty on this auth path).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_norm   text;
  v_domain text;
  v_dupe   boolean := false;
  v_recent int := 0;
begin
  v_norm   := public.normalize_email(new.email);
  v_domain := lower(split_part(new.email, '@', 2));

  -- Per-domain burst guard (a real smurf signal). Loose + domain-scoped so
  -- unrelated users never throttle each other. Raises → GoTrue 500 (rare path).
  select count(*) into v_recent
  from public.profiles
  where created_at > now() - interval '10 minutes'
    and normalized_email like '%@' || v_domain;
  if v_recent > 25 then
    raise exception 'signup temporarily rate-limited for this email domain';
  end if;

  -- Duplicate inbox (same normalized email already exists) → flag, don't block.
  select exists(select 1 from public.profiles where normalized_email = v_norm) into v_dupe;

  insert into public.profiles (id, name, wallet, normalized_email, dupe_flag)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'wallet',
    v_norm,
    v_dupe
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
-- (trigger on_auth_user_created already bound in pretest_setup.sql)

-- Backfill normalized_email for existing rows (best-effort; needs the email,
-- which lives in auth.users — join once).
update public.profiles p
set normalized_email = public.normalize_email(u.email)
from auth.users u
where u.id = p.id and p.normalized_email is null;


-- ════════════════════════════════════════════════════════════
-- PART E — (SESSION 2) "Before user created" hook function
-- ════════════════════════════════════════════════════════════
-- This one BLOCKS disposable-domain signups WITH a human-readable message.
-- It does nothing until YOU register it: Dashboard → Authentication → Hooks →
-- "Before user created" → Postgres → public.before_user_created_guard.
-- Then run the two grants at the bottom and immediately test one real signup.
create or replace function public.before_user_created_guard(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email  text;
  v_domain text;
begin
  v_email  := lower(event #>> '{claims,email}');
  if v_email is null then v_email := lower(event #>> '{user_metadata,email}'); end if;
  if v_email is null then v_email := lower(event #>> '{email}'); end if;
  v_domain := split_part(coalesce(v_email,''), '@', 2);

  if v_domain <> '' and exists (select 1 from public.domain_blocklist where domain = v_domain) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Disposable email addresses are not allowed. Use a permanent inbox.'
      )
    );
  end if;
  return event;  -- allow
end;
$$;
-- SESSION-2 grants (run WITH the hook registration, then test a signup):
--   grant execute on function public.before_user_created_guard(jsonb) to supabase_auth_admin;
--   grant select on public.domain_blocklist to supabase_auth_admin;


-- ════════════════════════════════════════════════════════════
-- VERIFICATION (run after; all should look sane)
-- ════════════════════════════════════════════════════════════
-- select column_name from information_schema.columns
--   where table_name='profiles' and column_name in
--   ('suspended_until','suspend_reason','normalized_email','dupe_flag');   -- 4 rows
-- select public.normalize_email('U.S.E.R+promo@googlemail.com');           -- user@gmail.com
-- select count(*) from public.domain_blocklist;                            -- ~45
-- select proname from pg_proc where proname in
--   ('is_current_user_suspended','log_security_event','before_user_created_guard'); -- 3 rows
-- select public.log_security_event('test', 'fp_demo', 'me@example.com', 5, '{}'::jsonb, 'ua');
-- select kind, ip, ip_hash is not null hashed, fingerprint from public.security_events order by created_at desc limit 1;
