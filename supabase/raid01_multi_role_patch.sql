-- Allow a hunter to take multiple roles in the same raid (max 3, extra cost).
-- Drops the UNIQUE(raid_id, user_id) constraint so the same user can have
-- multiple raid_members rows with different roles.
-- UNIQUE(raid_id, role) is kept so each role is still exclusive per raid.

alter table public.raid_members drop constraint if exists raid_members_raid_id_user_id_key;

-- ── Refund extra-role purchases on disband ──────────────────
-- Multi-role introduced a second charge ('raid-extra:<raid>') alongside the
-- base entry ('raid-entry:<raid>'). A member leaving on their own refunds both
-- client-side, but when the LEADER disbands, RLS stops them touching another
-- hunter's gate_unlocks rows — so joiners' extra-role $SHARD was stranded.
-- refund_raid_entries already runs as SECURITY DEFINER for exactly this case;
-- it just needs to clear the extra rows too. Same authorization as before
-- (raid creator or admin), same refund-before-breach intent — no change to
-- what anything costs.
create or replace function public.refund_raid_entries(p_raid_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.raids r
    where r.id = p_raid_id
      and (r.created_by = auth.uid() or public.is_current_user_admin())
  ) then
    raise exception 'not authorized to refund raid %', p_raid_id;
  end if;

  delete from public.gate_unlocks
  where quest_id in (
    'raid-entry:' || p_raid_id::text,
    'raid-extra:' || p_raid_id::text
  );
end;
$$;

grant execute on function public.refund_raid_entries(uuid) to authenticated;
