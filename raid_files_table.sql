-- Run this in Supabase SQL Editor
-- Creates raid_files table for the in-browser Raid IDE

create table if not exists public.raid_files (
  id         uuid primary key default gen_random_uuid(),
  raid_id    uuid not null references public.raids(id) on delete cascade,
  role       text not null check (role in ('interface','signal','vault','cipher','architect')),
  path       text not null,
  content    text not null default '',
  updated_by uuid references auth.users,
  updated_at timestamptz not null default now(),
  unique(raid_id, role, path)
);

alter table public.raid_files enable row level security;

-- All authenticated users can read files in raids they are members of
create policy "raid_files_read" on public.raid_files
  for select using (auth.uid() is not null);

-- Any authenticated user can write files (role-trust enforced client-side)
create policy "raid_files_write" on public.raid_files
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Enable realtime on raid_files
alter publication supabase_realtime add table public.raid_files;
