-- ============================================================
-- DEPLOY FRIENDS + RAID INVITES SYSTEM
-- Run this in Supabase SQL Editor (safe to re-run).
-- Based on supabase/friends.sql with invite_to_raid fix for
-- raid creators who haven't picked a role yet.
-- ============================================================

-- 1. Tables
create table if not exists public.friend_requests (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint fr_no_self_friend check (sender_id <> receiver_id)
);

drop index if exists public.fr_active_uidx;
create unique index fr_active_uidx on public.friend_requests
  (least(sender_id, receiver_id), greatest(sender_id, receiver_id))
  where status <> 'declined';

create index if not exists fr_receiver_idx on public.friend_requests (receiver_id, status);
create index if not exists fr_sender_idx   on public.friend_requests (sender_id, status);

create table if not exists public.raid_invites (
  id          uuid primary key default gen_random_uuid(),
  raid_id     uuid not null references public.raids(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  invitee_id  uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at  timestamptz not null default now()
);

drop index if exists public.ri_pending_uidx;
create unique index ri_pending_uidx on public.raid_invites (raid_id, invitee_id)
  where status = 'pending';

create index if not exists ri_invitee_idx on public.raid_invites (invitee_id, status);
create index if not exists ri_raid_idx    on public.raid_invites (raid_id, status);

-- 2. View
drop view if exists public.friends_v;
create or replace view public.friends_v
  (friend_id, name, avatar, username_color, friend_since)
as
select
  case
    when fr.sender_id = auth.uid() then fr.receiver_id
    else fr.sender_id
  end as friend_id,
  p.name,
  p.avatar,
  p.username_color,
  fr.updated_at as friend_since
from friend_requests fr
join profiles p on p.id = case
  when fr.sender_id = auth.uid() then fr.receiver_id
  else fr.sender_id
end
where fr.status = 'accepted'
  and (fr.sender_id = auth.uid() or fr.receiver_id = auth.uid());

-- 3. RLS
alter table public.friend_requests enable row level security;
drop policy if exists "fr_select_involved" on public.friend_requests;
create policy "fr_select_involved" on public.friend_requests
  for select using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or public.is_current_user_admin()
  );
drop policy if exists "fr_admin_all" on public.friend_requests;
create policy "fr_admin_all" on public.friend_requests
  for all using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

alter table public.raid_invites enable row level security;
drop policy if exists "ri_select_involved" on public.raid_invites;
create policy "ri_select_involved" on public.raid_invites
  for select using (
    sender_id = auth.uid()
    or invitee_id = auth.uid()
    or exists (
      select 1 from public.raid_members rm
      where rm.raid_id = raid_invites.raid_id and rm.user_id = auth.uid()
    )
    or public.is_current_user_admin()
  );
drop policy if exists "ri_admin_all" on public.raid_invites;
create policy "ri_admin_all" on public.raid_invites
  for all using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- 4. Functions (SECURITY DEFINER)
create or replace function public.send_friend_request(p_target uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_req uuid;
  v_low  uuid;
  v_high uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_target is null or p_target = v_uid then raise exception 'Cannot friend yourself'; end if;
  if not exists (select 1 from profiles where id = p_target) then raise exception 'Hunter not found'; end if;
  v_low  := least(v_uid, p_target);
  v_high := greatest(v_uid, p_target);
  select id into v_req from friend_requests
   where least(sender_id, receiver_id) = v_low
     and greatest(sender_id, receiver_id) = v_high
     and status <> 'declined' limit 1;
  if v_req is not null then return v_req; end if;
  insert into friend_requests (sender_id, receiver_id, status)
  values (v_uid, p_target, 'pending') returning id into v_req;
  return v_req;
end;
$$;

create or replace function public.respond_friend_request(p_request_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_receiver uuid;
  v_status   text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select receiver_id, status into v_receiver, v_status from friend_requests where id = p_request_id;
  if not found then raise exception 'Friend request not found'; end if;
  if v_receiver <> v_uid then raise exception 'Not your request to respond to'; end if;
  if v_status <> 'pending' then raise exception 'Request already responded to'; end if;
  update friend_requests set status = case when p_accept then 'accepted' else 'declined' end, updated_at = now()
  where id = p_request_id;
end;
$$;

create or replace function public.remove_friend(p_friend_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  delete from friend_requests
  where status = 'accepted'
    and ((sender_id = v_uid and receiver_id = p_friend_id) or (sender_id = p_friend_id and receiver_id = v_uid));
  if not found then raise exception 'Friend not found'; end if;
end;
$$;

create or replace function public.list_friends()
returns table (friend_id uuid, name text, avatar jsonb, username_color text, friend_since timestamptz)
language sql
security definer
set search_path = public
as $$
  select friend_id, name, avatar, username_color, friend_since from friends_v order by name;
$$;

create or replace function public.list_friend_requests()
returns table (request_id uuid, sender_id uuid, name text, avatar jsonb, username_color text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select fr.id, fr.sender_id, p.name, p.avatar, p.username_color, fr.created_at
  from friend_requests fr join profiles p on p.id = fr.sender_id
  where fr.receiver_id = auth.uid() and fr.status = 'pending'
  order by fr.created_at desc;
$$;

create or replace function public.invite_to_raid(p_raid_id uuid, p_invitee_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_invitee_id = v_uid then raise exception 'Cannot invite yourself'; end if;
  select role into v_role from raid_members where raid_id = p_raid_id and user_id = v_uid;
  if not found then
    if not exists (select 1 from raids where id = p_raid_id and created_by = v_uid) then
      raise exception 'You are not in this raid';
    end if;
  end if;
  if not exists (select 1 from raids where id = p_raid_id and status = 'bg_lobby') then
    raise exception 'Raid is no longer in lobby';
  end if;
  if not exists (select 1 from profiles where id = p_invitee_id) then
    raise exception 'Hunter not found';
  end if;
  if exists (select 1 from raid_members where raid_id = p_raid_id and user_id = p_invitee_id) then
    raise exception 'Hunter is already in this raid';
  end if;
  if exists (select 1 from raid_invites
    where raid_id = p_raid_id and invitee_id = p_invitee_id and status = 'pending') then
    raise exception 'Hunter already invited';
  end if;
  insert into raid_invites (raid_id, sender_id, invitee_id)
  values (p_raid_id, v_uid, p_invitee_id) returning id into v_role;
  return v_role;
end;
$$;

create or replace function public.respond_raid_invite(p_invite_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_invitee uuid;
  v_status  text;
  v_raid_id uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select invitee_id, status, raid_id into v_invitee, v_status, v_raid_id
  from raid_invites where id = p_invite_id;
  if not found then raise exception 'Invite not found'; end if;
  if v_invitee <> v_uid then raise exception 'Not your invite to respond to'; end if;
  if v_status <> 'pending' then raise exception 'Invite already responded to'; end if;
  if not exists (select 1 from raids where id = v_raid_id and status = 'bg_lobby') then
    raise exception 'Raid is no longer in lobby';
  end if;
  if p_accept then
    if (select count(*) from raid_members where raid_id = v_raid_id) >= 5 then
      raise exception 'Raid is full';
    end if;
  end if;
  update raid_invites set status = case when p_accept then 'accepted' else 'declined' end
  where id = p_invite_id;
end;
$$;

create or replace function public.list_raid_invites(p_raid_id uuid)
returns table (invite_id uuid, invitee_id uuid, name text, avatar jsonb, status text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select ri.id, ri.invitee_id, p.name, p.avatar, ri.status, ri.created_at
  from raid_invites ri join profiles p on p.id = ri.invitee_id
  where ri.raid_id = p_raid_id
  order by ri.created_at desc;
$$;

create or replace function public.list_my_raid_invites()
returns table (invite_id uuid, raid_id uuid, raid_name text, sender_id uuid, sender_name text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select ri.id, ri.raid_id, r.name, ri.sender_id, p.name as sender_name, ri.created_at
  from raid_invites ri
  join raids r on r.id = ri.raid_id
  join profiles p on p.id = ri.sender_id
  where ri.invitee_id = auth.uid() and ri.status = 'pending'
  order by ri.created_at desc;
$$;

create or replace function public.cancel_raid_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_sender uuid;
  v_leader uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select ri.sender_id, r.created_by into v_sender, v_leader
  from raid_invites ri join raids r on r.id = ri.raid_id
  where ri.id = p_invite_id;
  if not found then raise exception 'Invite not found'; end if;
  if v_uid <> v_sender and v_uid <> v_leader then
    raise exception 'Only the sender or raid leader can cancel';
  end if;
  update raid_invites set status = 'declined' where id = p_invite_id;
end;
$$;
