-- ============================================================
-- Raid entry refund on disband (optional but recommended)
-- Run in the Supabase SQL Editor. Idempotent (create or replace).
--
-- When a raid leader disbands a lobby (pre-start) raid, every member's
-- 1000 $DRIFT entry should be returned. Members can refund their OWN entry
-- client-side (RLS allows deleting your own gate_unlocks), but the leader
-- can't delete OTHER members' rows — so this SECURITY DEFINER function does
-- it, authorized only for the raid's creator (or an admin).
--
-- Without this, the app still refunds the acting user's own entry on
-- leave/disband; this just also covers joiners when a leader disbands.
-- ============================================================

create or replace function public.refund_raid_entries(p_raid_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only the raid creator or an admin may trigger a refund-all.
  if not exists (
    select 1 from public.raids r
    where r.id = p_raid_id
      and (r.created_by = auth.uid() or public.is_current_user_admin())
  ) then
    raise exception 'not authorized to refund raid %', p_raid_id;
  end if;

  delete from public.gate_unlocks
  where quest_id = 'raid-entry:' || p_raid_id::text;
end;
$$;

grant execute on function public.refund_raid_entries(uuid) to authenticated;
