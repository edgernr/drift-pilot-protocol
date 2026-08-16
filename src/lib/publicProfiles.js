import { supabase } from './supabase'

// ── Cross-user display names ─────────────────────────────────────────────────
// Anything that needs ANOTHER hunter's name reads the `public_profiles` VIEW,
// never the `profiles` table. The base table carries normalized_email, wallet,
// stripe_customer_id and the moderation columns, so the app must not depend on
// being able to read other people's rows there — otherwise the row policy that
// closes that hole would blank out every party roster.
//
// PostgREST embeds (`raid_members.select('*, profiles(name)')`) are exactly
// that kind of dependency, which is why they're replaced by a batched lookup
// through the view instead.

/**
 * Attach display names to rows that carry a user id.
 * One extra request per batch, deduped — not one per row.
 *
 * @param rows    array of records
 * @param idKey   field holding the hunter's uuid (default 'user_id')
 * @param nameKey field to write the resolved name into (default 'name')
 */
export async function attachNames(rows, idKey = 'user_id', nameKey = 'name') {
  const list = rows ?? []
  const ids = [...new Set(list.map(r => r?.[idKey]).filter(Boolean))]
  if (!ids.length) return list

  const { data } = await supabase
    .from('public_profiles')
    .select('id, name, avatar, username_color')
    .in('id', ids)

  const byId = Object.fromEntries((data ?? []).map(p => [p.id, p]))
  return list.map(r => {
    const p = byId[r?.[idKey]]
    return {
      ...r,
      [nameKey]: p?.name ?? 'HUNTER',
      avatar: p?.avatar ?? null,
      username_color: p?.username_color ?? null,
    }
  })
}

/** Single-id convenience wrapper. */
export async function displayName(userId, fallback = 'HUNTER') {
  if (!userId) return fallback
  const { data } = await supabase
    .from('public_profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle()
  return data?.name ?? fallback
}
