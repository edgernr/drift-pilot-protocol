-- ============================================================
-- Void Shards — GUILDS + HUNTER SIGIL AVATARS
-- Player-run GUILDS licensed by the Association, plus a procedural
-- avatar (jsonb) column on profiles. One idempotent file.
--
-- ⚠️  RUN THIS MANUALLY in the Supabase SQL Editor — there is NO migration
--     tooling in this project. Paste the whole file and run it once.
--     It is safe to re-run (CREATE ... IF NOT EXISTS / CREATE OR REPLACE /
--     DROP POLICY IF EXISTS everywhere).
--
--     RUN ORDER — this file goes LAST, AFTER these have already been applied:
--        1. supabase/pretest_setup.sql
--        2. eva-react/academy_schema.sql
--        3. eva-react/raid_files_table.sql
--        4. supabase/security.sql              <- defines is_current_user_admin()
--        5. eva-react/supabase/prologue_done.sql
--        6. eva-react/supabase/guilds.sql      <- THIS FILE
--
--     Depends on: public.profiles, public.quest_completions,
--                 public.is_current_user_admin().
--
-- Owner decisions baked in (locked 2026-07-13):
--   • Player orgs = GUILDS. THE Hunter Association stays singular canon.
--   • Founding a guild is FREE — no $SHARD sink, zero economy coupling.
--   • Guilds are social + cosmetic at launch; schema kept perk-ready.
--   • Member cap = 20, per-guild (guilds.member_cap) so it can be tuned later.
--   • Master rename/re-tag has a 7-day cooldown (guilds.renamed_at).
--
-- SECURITY MODEL: all guild WRITES go through SECURITY DEFINER functions
-- (create_guild / apply_to_guild / invite_to_guild / respond_request / ...),
-- so role logic lives in SQL, never in client trust. The tables expose only
-- public SELECT (+ admin ALL) policies; there are NO client insert/update/
-- delete policies, which forces every mutation through the vetted functions.
--
-- VERIFICATION (run after applying — logged in as a real authed user):
--   select public.create_guild('Void Wardens','VWARD','{"seed":7,"palette":1}');
--   select * from public.guild_directory;                    -- your guild, member_count 1
--   select * from public.guild_roster where guild_id = (select guild_id from public.guild_members where user_id = auth.uid());
--   select id, name, avatar, guild_tag, is_banned from public.public_profiles where id = auth.uid();
-- ============================================================


-- ============================================================
-- 1. profiles.avatar  — procedural Hunter Sigil config (seed + palette)
--    Read for free via AuthContext's select('*'). Empty {} => initials fallback.
-- ============================================================

alter table public.profiles add column if not exists avatar jsonb default '{}'::jsonb;


-- ============================================================
-- 2. TABLES
-- ============================================================

-- 2a. guilds ------------------------------------------------
create table if not exists public.guilds (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tag         text not null,
  emblem      jsonb not null default '{}'::jsonb,   -- procedural: { seed, palette } — NOT a URL
  motd        text not null default '',
  description text not null default '',
  member_cap  int  not null default 20,             -- per-guild cap (owner default 20; tunable)
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  renamed_at  timestamptz not null default now(),   -- for the 7-day rename/re-tag cooldown
  constraint guilds_name_len  check (char_length(name) between 3 and 24),
  constraint guilds_tag_shape check (tag ~ '^[A-Z0-9]{2,5}$'),
  constraint guilds_motd_len  check (char_length(motd) <= 280),
  constraint guilds_desc_len  check (char_length(description) <= 1000),
  constraint guilds_cap_range check (member_cap between 1 and 500)
);

-- case-insensitive uniqueness on name + tag (prevents "VoidWardens"/"voidwardens" dupes)
drop index if exists public.guilds_name_lower_uidx;
create unique index guilds_name_lower_uidx on public.guilds (lower(name));
drop index if exists public.guilds_tag_lower_uidx;
create unique index guilds_tag_lower_uidx on public.guilds (lower(tag));

-- 2b. guild_members -----------------------------------------
create table if not exists public.guild_members (
  id        uuid primary key default gen_random_uuid(),
  guild_id  uuid not null references public.guilds(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'member' check (role in ('master','officer','member')),
  joined_at timestamptz not null default now(),
  unique (user_id)     -- THE pivotal constraint: one guild per hunter
);
create index if not exists guild_members_guild_idx on public.guild_members (guild_id);

-- 2c. guild_requests (invites + applications) ---------------
create table if not exists public.guild_requests (
  id         uuid primary key default gen_random_uuid(),
  guild_id   uuid not null references public.guilds(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,   -- the prospective member
  kind       text not null check (kind in ('invite','application')),
  status     text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
-- at most one PENDING request of a given kind per (guild,user)
drop index if exists public.guild_requests_pending_uidx;
create unique index guild_requests_pending_uidx
  on public.guild_requests (guild_id, user_id, kind)
  where status = 'pending';
create index if not exists guild_requests_user_idx  on public.guild_requests (user_id, status);
create index if not exists guild_requests_guild_idx on public.guild_requests (guild_id, status);


-- ============================================================
-- 3. ROW LEVEL SECURITY
--    Public read for directory/roster/profile joins. All writes are done
--    by SECURITY DEFINER functions (no client write policies).
-- ============================================================

-- 3a. guilds — public read, admin manage (P5 command panel) --
alter table public.guilds enable row level security;

drop policy if exists "guilds_public_read" on public.guilds;
create policy "guilds_public_read" on public.guilds
  for select using (true);

drop policy if exists "guilds_admin_all" on public.guilds;
create policy "guilds_admin_all" on public.guilds
  for all using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- 3b. guild_members — public read (roster + profile tag), admin manage --
alter table public.guild_members enable row level security;

drop policy if exists "gm_public_read" on public.guild_members;
create policy "gm_public_read" on public.guild_members
  for select using (true);

drop policy if exists "gm_admin_all" on public.guild_members;
create policy "gm_admin_all" on public.guild_members
  for all using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- 3c. guild_requests — visible to the target user + that guild's officers --
alter table public.guild_requests enable row level security;

drop policy if exists "greq_select_involved" on public.guild_requests;
create policy "greq_select_involved" on public.guild_requests
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.guild_members m
      where m.guild_id = guild_requests.guild_id
        and m.user_id = auth.uid()
        and m.role in ('master','officer')
    )
    or public.is_current_user_admin()
  );

drop policy if exists "greq_admin_all" on public.guild_requests;
create policy "greq_admin_all" on public.guild_requests
  for all using (public.is_current_user_admin())
  with check (public.is_current_user_admin());


-- ============================================================
-- 4. SECURITY DEFINER FUNCTIONS  (all role/permission logic lives here)
--    Every function runs with definer rights (bypasses RLS) but re-derives
--    the caller from auth.uid() and raises on any violation.
-- ============================================================

-- 4a. create_guild — founder becomes master, atomically -------
create or replace function public.create_guild(
  p_name   text,
  p_tag    text,
  p_emblem jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_name  text := trim(coalesce(p_name, ''));
  v_tag   text := upper(trim(coalesce(p_tag, '')));
  v_guild uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if char_length(v_name) < 3 or char_length(v_name) > 24 then
    raise exception 'Guild name must be 3–24 characters';
  end if;
  if v_tag !~ '^[A-Z0-9]{2,5}$' then
    raise exception 'Guild tag must be 2–5 letters or numbers';
  end if;
  if exists (select 1 from guild_members where user_id = v_uid) then
    raise exception 'You are already in a guild';
  end if;
  if exists (select 1 from guilds where lower(name) = lower(v_name)) then
    raise exception 'That guild name is already taken';
  end if;
  if exists (select 1 from guilds where lower(tag) = lower(v_tag)) then
    raise exception 'That guild tag is already taken';
  end if;

  begin
    insert into guilds (name, tag, emblem, created_by)
    values (v_name, v_tag, coalesce(p_emblem, '{}'::jsonb), v_uid)
    returning id into v_guild;
  exception when unique_violation then
    raise exception 'That guild name or tag is already taken';
  end;

  insert into guild_members (guild_id, user_id, role)
  values (v_guild, v_uid, 'master');

  -- clear any stale pending requests this founder had elsewhere
  delete from guild_requests where user_id = v_uid and status = 'pending';

  return v_guild;
end;
$$;

-- 4b. apply_to_guild — a hunter applies to join --------------
create or replace function public.apply_to_guild(p_guild_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_req uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from guilds where id = p_guild_id) then
    raise exception 'Guild not found';
  end if;
  if exists (select 1 from guild_members where user_id = v_uid) then
    raise exception 'You are already in a guild';
  end if;

  -- if the guild already invited you, accept that invite outright
  select id into v_req from guild_requests
   where guild_id = p_guild_id and user_id = v_uid and kind = 'invite' and status = 'pending'
   limit 1;
  if v_req is not null then
    perform public.respond_request(v_req, true);
    return v_req;
  end if;

  -- idempotent: reuse an existing pending application
  select id into v_req from guild_requests
   where guild_id = p_guild_id and user_id = v_uid and kind = 'application' and status = 'pending'
   limit 1;
  if v_req is not null then return v_req; end if;

  insert into guild_requests (guild_id, user_id, kind, created_by)
  values (p_guild_id, v_uid, 'application', v_uid)
  returning id into v_req;
  return v_req;
end;
$$;

-- 4c. invite_to_guild — an officer/master invites a hunter ---
create or replace function public.invite_to_guild(p_guild_id uuid, p_target uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_req uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not exists (
    select 1 from guild_members
    where guild_id = p_guild_id and user_id = v_uid and role in ('master','officer')
  ) then
    raise exception 'Only officers can invite';
  end if;
  if not exists (select 1 from profiles where id = p_target) then
    raise exception 'Hunter not found';
  end if;
  if exists (select 1 from guild_members where user_id = p_target) then
    raise exception 'That hunter is already in a guild';
  end if;

  -- if they already applied, accept the application instead of double-inviting
  select id into v_req from guild_requests
   where guild_id = p_guild_id and user_id = p_target and kind = 'application' and status = 'pending'
   limit 1;
  if v_req is not null then
    perform public.respond_request(v_req, true);
    return v_req;
  end if;

  select id into v_req from guild_requests
   where guild_id = p_guild_id and user_id = p_target and kind = 'invite' and status = 'pending'
   limit 1;
  if v_req is not null then return v_req; end if;

  insert into guild_requests (guild_id, user_id, kind, created_by)
  values (p_guild_id, p_target, 'invite', v_uid)
  returning id into v_req;
  return v_req;
end;
$$;

-- 4d. respond_request — accept/decline an invite or application
create or replace function public.respond_request(p_request_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  r     guild_requests%rowtype;
  v_count int;
  v_cap   int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select * into r from guild_requests where id = p_request_id;
  if not found then raise exception 'Request not found'; end if;
  if r.status <> 'pending' then raise exception 'Request already resolved'; end if;

  -- authorization: invite -> the target responds; application -> an officer responds
  if r.kind = 'invite' then
    if r.user_id <> v_uid then raise exception 'Not your invite'; end if;
  else -- application
    if not exists (
      select 1 from guild_members
      where guild_id = r.guild_id and user_id = v_uid and role in ('master','officer')
    ) then
      raise exception 'Only officers can respond to applications';
    end if;
  end if;

  if not p_accept then
    update guild_requests set status = 'declined' where id = r.id;
    return;
  end if;

  -- accepting: re-validate membership + cap at commit time
  if exists (select 1 from guild_members where user_id = r.user_id) then
    update guild_requests set status = 'declined' where id = r.id;
    raise exception 'That hunter is already in a guild';
  end if;
  -- lock the guild row so concurrent accepts can't both slip past the cap
  select member_cap into v_cap from guilds where id = r.guild_id for update;
  select count(*) into v_count from guild_members where guild_id = r.guild_id;
  if v_count >= v_cap then raise exception 'Guild is full'; end if;

  begin
    insert into guild_members (guild_id, user_id, role)
    values (r.guild_id, r.user_id, 'member');
  exception when unique_violation then
    -- a different guild accepted this hunter in the same instant
    raise exception 'That hunter is already in a guild';
  end;

  update guild_requests set status = 'accepted' where id = r.id;
  -- the new member's other pending requests are now moot
  delete from guild_requests where user_id = r.user_id and status = 'pending' and id <> r.id;
end;
$$;

-- 4e. cancel_request — applicant withdraws, or officer rescinds an invite
create or replace function public.cancel_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  r     guild_requests%rowtype;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into r from guild_requests where id = p_request_id;
  if not found then return; end if;
  if r.user_id <> v_uid
     and not exists (
       select 1 from guild_members
       where guild_id = r.guild_id and user_id = v_uid and role in ('master','officer')
     )
     and not public.is_current_user_admin() then
    raise exception 'Not allowed';
  end if;
  delete from guild_requests where id = r.id;
end;
$$;

-- 4f. leave_guild — sole master disbands; other master must transfer first
create or replace function public.leave_guild()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_guild uuid;
  v_role  text;
  v_others int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select guild_id, role into v_guild, v_role from guild_members where user_id = v_uid;
  if v_guild is null then raise exception 'You are not in a guild'; end if;

  if v_role = 'master' then
    select count(*) into v_others from guild_members where guild_id = v_guild and user_id <> v_uid;
    if v_others > 0 then
      raise exception 'Transfer leadership before leaving';
    end if;
    -- sole member master: leaving disbands the guild (cascades members + requests)
    delete from guilds where id = v_guild;
    return;
  end if;

  delete from guild_members where user_id = v_uid;
end;
$$;

-- 4g. kick_member — master kicks anyone; officer kicks members only
create or replace function public.kick_member(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_guild  uuid;
  v_role   text;
  v_trole  text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_target = v_uid then raise exception 'Use leave to exit your own guild'; end if;
  select guild_id, role into v_guild, v_role from guild_members where user_id = v_uid;
  if v_guild is null or v_role not in ('master','officer') then
    raise exception 'Only officers can remove members';
  end if;
  select role into v_trole from guild_members where user_id = p_target and guild_id = v_guild;
  if v_trole is null then raise exception 'That hunter is not in your guild'; end if;
  if v_role = 'officer' and v_trole <> 'member' then
    raise exception 'Officers can only remove members';
  end if;
  if v_trole = 'master' then raise exception 'Cannot remove the guild master'; end if;

  delete from guild_members where user_id = p_target and guild_id = v_guild;
end;
$$;

-- 4h. set_role — master promotes/demotes between officer and member
create or replace function public.set_role(p_target uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_guild uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_role not in ('officer','member') then raise exception 'Invalid role'; end if;
  if p_target = v_uid then raise exception 'Cannot change your own role'; end if;
  select guild_id into v_guild from guild_members where user_id = v_uid and role = 'master';
  if v_guild is null then raise exception 'Only the guild master can set roles'; end if;
  if not exists (select 1 from guild_members where user_id = p_target and guild_id = v_guild) then
    raise exception 'That hunter is not in your guild';
  end if;

  update guild_members set role = p_role where user_id = p_target and guild_id = v_guild;
end;
$$;

-- 4i. transfer_master — hand leadership to another member ----
create or replace function public.transfer_master(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_guild uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_target = v_uid then raise exception 'You are already the master'; end if;
  select guild_id into v_guild from guild_members where user_id = v_uid and role = 'master';
  if v_guild is null then raise exception 'Only the guild master can transfer leadership'; end if;
  if not exists (select 1 from guild_members where user_id = p_target and guild_id = v_guild) then
    raise exception 'That hunter is not in your guild';
  end if;

  update guild_members set role = 'officer' where user_id = v_uid    and guild_id = v_guild;
  update guild_members set role = 'master'  where user_id = p_target and guild_id = v_guild;
end;
$$;

-- 4j. disband_guild — master deletes the guild (cascade) -----
create or replace function public.disband_guild()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_guild uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select guild_id into v_guild from guild_members where user_id = v_uid and role = 'master';
  if v_guild is null then raise exception 'Only the guild master can disband'; end if;
  delete from guilds where id = v_guild;
end;
$$;

-- 4k. set_motd — officer/master updates the message of the day
create or replace function public.set_motd(p_motd text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_guild uuid;
  v_text  text := coalesce(p_motd, '');
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if char_length(v_text) > 280 then raise exception 'MOTD must be 280 characters or fewer'; end if;
  select guild_id into v_guild from guild_members
   where user_id = v_uid and role in ('master','officer');
  if v_guild is null then raise exception 'Only officers can set the MOTD'; end if;
  update guilds set motd = v_text where id = v_guild;
end;
$$;

-- 4l. update_guild_meta — master edits description + emblem --
create or replace function public.update_guild_meta(p_description text, p_emblem jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_guild uuid;
  v_desc  text := coalesce(p_description, '');
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if char_length(v_desc) > 1000 then raise exception 'Description too long'; end if;
  select guild_id into v_guild from guild_members where user_id = v_uid and role = 'master';
  if v_guild is null then raise exception 'Only the guild master can edit the guild'; end if;
  update guilds
     set description = v_desc,
         emblem = coalesce(p_emblem, emblem)
   where id = v_guild;
end;
$$;

-- 4m. rename_guild — master renames/re-tags (7-day cooldown) -
create or replace function public.rename_guild(p_name text, p_tag text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_guild  uuid;
  v_since  timestamptz;
  v_name   text := trim(coalesce(p_name, ''));
  v_tag    text := upper(trim(coalesce(p_tag, '')));
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if char_length(v_name) < 3 or char_length(v_name) > 24 then
    raise exception 'Guild name must be 3–24 characters';
  end if;
  if v_tag !~ '^[A-Z0-9]{2,5}$' then
    raise exception 'Guild tag must be 2–5 letters or numbers';
  end if;
  select guild_id into v_guild from guild_members where user_id = v_uid and role = 'master';
  if v_guild is null then raise exception 'Only the guild master can rename the guild'; end if;

  select renamed_at into v_since from guilds where id = v_guild;
  if v_since > now() - interval '7 days' then
    raise exception 'Rename is on cooldown — % day(s) left',
      ceil(extract(epoch from (v_since + interval '7 days' - now())) / 86400)::int;
  end if;
  if exists (select 1 from guilds where lower(name) = lower(v_name) and id <> v_guild) then
    raise exception 'That guild name is already taken';
  end if;
  if exists (select 1 from guilds where lower(tag) = lower(v_tag) and id <> v_guild) then
    raise exception 'That guild tag is already taken';
  end if;

  update guilds set name = v_name, tag = v_tag, renamed_at = now() where id = v_guild;
end;
$$;

-- 4n. execute grants — authenticated only (anon is blocked; fns self-guard too)
do $$
declare fn text;
begin
  foreach fn in array array[
    'create_guild(text,text,jsonb)',
    'apply_to_guild(uuid)',
    'invite_to_guild(uuid,uuid)',
    'respond_request(uuid,boolean)',
    'cancel_request(uuid)',
    'leave_guild()',
    'kick_member(uuid)',
    'set_role(uuid,text)',
    'transfer_master(uuid)',
    'disband_guild()',
    'set_motd(text)',
    'update_guild_meta(text,jsonb)',
    'rename_guild(text,text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon;', fn);
    execute format('grant execute on function public.%s to authenticated;', fn);
  end loop;
end;
$$;


-- ============================================================
-- 5. PUBLIC READ VIEWS (definer rights; only non-sensitive columns)
--    Mirrors the pretest_setup.sql §5 pattern. NEVER exposes
--    wallet / is_admin / stripe_* / raw banned_until.
-- ============================================================

-- 5a. public_profiles — safe per-hunter card + guild tag -----
create or replace view public.public_profiles as
  select
    p.id,
    coalesce(p.name, 'Seeker')                               as name,
    p.username_color,
    p.avatar,
    p.is_founder,
    p.is_subscribed,
    p.created_at,
    (p.banned_until is not null and p.banned_until > now())  as is_banned,
    gm.guild_id,
    gm.role                                                  as guild_role,
    g.name                                                   as guild_name,
    g.tag                                                    as guild_tag,
    g.emblem                                                 as guild_emblem
  from public.profiles p
  left join public.guild_members gm on gm.user_id = p.id
  left join public.guilds        g  on g.id       = gm.guild_id;

alter view public.public_profiles set (security_invoker = off);
grant select on public.public_profiles to anon, authenticated;

-- 5b. guild_directory — one row per guild, with aggregates ---
create or replace view public.guild_directory as
  select
    g.id, g.name, g.tag, g.emblem, g.description, g.motd,
    g.member_cap, g.created_at,
    count(distinct gm.user_id)::int                                                      as member_count,
    coalesce(sum(qc.xp_earned) filter (where qc.quest_id not like '%:bank'), 0)::bigint  as combined_xp,
    count(qc.id) filter (where qc.quest_id like 'act1-ch%')::int                          as combined_clears
  from public.guilds g
  left join public.guild_members    gm on gm.guild_id = g.id
  left join public.quest_completions qc on qc.user_id = gm.user_id
  group by g.id;

alter view public.guild_directory set (security_invoker = off);
grant select on public.guild_directory to anon, authenticated;

-- 5c. guild_roster — one row per membership, safe member card
create or replace view public.guild_roster as
  select
    gm.guild_id,
    gm.user_id,
    gm.role,
    gm.joined_at,
    coalesce(p.name, 'Seeker')                                                          as name,
    p.username_color,
    p.avatar,
    p.is_founder,
    coalesce(sum(qc.xp_earned) filter (where qc.quest_id not like '%:bank'), 0)::bigint as total_xp,
    count(qc.id) filter (where qc.quest_id like 'act1-ch%')::int                         as clears
  from public.guild_members gm
  join public.profiles p on p.id = gm.user_id
  left join public.quest_completions qc on qc.user_id = gm.user_id
  group by gm.guild_id, gm.user_id, gm.role, gm.joined_at,
           p.name, p.username_color, p.avatar, p.is_founder;

alter view public.guild_roster set (security_invoker = off);
grant select on public.guild_roster to anon, authenticated;

-- 5d. Extend the existing leaderboard view with avatar (leaderboard row sigils).
--     Mirrors pretest_setup.sql §5a and just adds p.avatar — additive, so existing
--     consumers that select id/name/total_xp keep working unchanged.
-- NOTE: existing columns (id, name, total_xp) must stay in their original order;
-- CREATE OR REPLACE VIEW only allows APPENDING new columns — so avatar goes LAST.
create or replace view public.leaderboard as
  select
    p.id,
    coalesce(p.name, 'Seeker') as name,
    coalesce(sum(qc.xp_earned) filter (where qc.quest_id not like '%:bank'), 0)::bigint as total_xp,
    p.avatar
  from public.profiles p
  left join public.quest_completions qc on qc.user_id = p.id
  group by p.id, p.name, p.avatar;

alter view public.leaderboard set (security_invoker = off);
grant select on public.leaderboard to anon, authenticated;


-- ============================================================
-- DONE.
--   • profiles.avatar added (Hunter Sigils).
--   • guilds / guild_members / guild_requests created with RLS.
--   • 13 SECURITY DEFINER functions own all guild mutations.
--   • public_profiles / guild_directory / guild_roster views for public pages.
-- Re-running this whole file is harmless.
-- ============================================================
