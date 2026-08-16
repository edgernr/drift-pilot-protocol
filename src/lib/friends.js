import { supabase } from './supabase'

export const sendFriendRequest    = (target)      => supabase.rpc('send_friend_request',    { p_target: target })
export const respondFriendRequest = (reqId, accept) => supabase.rpc('respond_friend_request', { p_request_id: reqId, p_accept: accept })
export const removeFriend         = (friendId)    => supabase.rpc('remove_friend',           { p_friend_id: friendId })
export const listFriends          = ()             => supabase.rpc('list_friends')
export const listFriendRequests   = ()             => supabase.rpc('list_friend_requests')
// Requests YOU sent that are still unanswered. list_friend_requests() only
// returns INCOMING ones, so without this the UI had no way to show that an
// ADD actually did anything — the row just vanished and nothing appeared,
// which reads exactly like a broken button.
export const listSentRequests     = (myId)         =>
  supabase.from('friend_requests')
    .select('receiver_id, created_at')
    .eq('sender_id', myId)
    .eq('status', 'pending')

export const inviteToRaid       = (raidId, inviteeId) => supabase.rpc('invite_to_raid',         { p_raid_id: raidId, p_invitee_id: inviteeId })
export const respondRaidInvite  = (inviteId, accept)  => supabase.rpc('respond_raid_invite',    { p_invite_id: inviteId, p_accept: accept })
export const listRaidInvites    = (raidId)            => supabase.rpc('list_raid_invites',      { p_raid_id: raidId })
export const listMyRaidInvites  = ()                  => supabase.rpc('list_my_raid_invites')
export const cancelRaidInvite   = (inviteId)          => supabase.rpc('cancel_raid_invite',     { p_invite_id: inviteId })

// Search the PUBLIC profile view, not `profiles` — RLS on the base table only
// exposes your own row, so querying it directly finds nobody but yourself.
// (`public_profiles` is the same view the guild invite search already uses.)
//
// The `user_id:id` alias matters: list_friends(), raid members and every
// consumer of this result index by `user_id`. Returning a bare `id` made the
// ADD button send `undefined` to send_friend_request, which the RPC rejected
// as "Cannot friend yourself" — silently, because nothing rendered the error.
export const searchHunters = (query, excludeId) => {
  let q = supabase
    .from('public_profiles')
    .select('user_id:id, name')
    .ilike('name', `%${query}%`)
    .limit(8)
  if (excludeId) q = q.neq('id', excludeId)
  return q
}

export function friendError(error) {
  if (!error) return null
  return error.message || error.details || 'Something went wrong'
}
