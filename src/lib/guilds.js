import { supabase } from './supabase'

// ── Guild mutations — SECURITY DEFINER RPCs from supabase/guilds.sql ──────────
// All role/permission logic lives in SQL; these are thin wrappers. Each returns
// Supabase's { data, error }. After any call that changes the CALLER's own
// membership (create / accept / leave / disband), the caller must refreshProfile().
export const createGuild     = (name, tag, emblem) => supabase.rpc('create_guild',     { p_name: name, p_tag: tag, p_emblem: emblem ?? {} })
export const applyToGuild    = (guildId)           => supabase.rpc('apply_to_guild',   { p_guild_id: guildId })
export const inviteToGuild   = (guildId, target)   => supabase.rpc('invite_to_guild',  { p_guild_id: guildId, p_target: target })
export const respondRequest  = (requestId, accept) => supabase.rpc('respond_request',  { p_request_id: requestId, p_accept: accept })
export const cancelRequest   = (requestId)         => supabase.rpc('cancel_request',   { p_request_id: requestId })
export const leaveGuild      = ()                  => supabase.rpc('leave_guild')
export const kickMember      = (target)            => supabase.rpc('kick_member',      { p_target: target })
export const setRole         = (target, role)      => supabase.rpc('set_role',         { p_target: target, p_role: role })
export const transferMaster  = (target)            => supabase.rpc('transfer_master',  { p_target: target })
export const disbandGuild    = ()                  => supabase.rpc('disband_guild')
export const setMotd         = (motd)              => supabase.rpc('set_motd',         { p_motd: motd })
export const updateGuildMeta = (description, emblem) => supabase.rpc('update_guild_meta', { p_description: description, p_emblem: emblem ?? {} })
export const renameGuild     = (name, tag)         => supabase.rpc('rename_guild',     { p_name: name, p_tag: tag })

// ── Public reads (definer-rights views) ──────────────────────────────────────
export const fetchDirectory = ()        => supabase.from('guild_directory').select('*').order('member_count', { ascending: false })
export const fetchGuild     = (id)      => supabase.from('guild_directory').select('*').eq('id', id).maybeSingle()
export const fetchRoster    = (guildId) => supabase.from('guild_roster').select('*').eq('guild_id', guildId)
export const fetchMyInvites = (userId)  =>
  supabase.from('guild_requests')
    .select('id, guild_id, created_at, guilds(name, tag, emblem)')
    .eq('user_id', userId).eq('kind', 'invite').eq('status', 'pending')
export const fetchApplications = (guildId) =>
  supabase.from('guild_requests')
    .select('id, user_id, created_at, public_profiles(name, avatar, username_color)')
    .eq('guild_id', guildId).eq('kind', 'application').eq('status', 'pending')
export const searchHunters = (q) =>
  supabase.from('public_profiles').select('id, name, avatar').ilike('name', `%${q}%`).limit(8)

// Human-readable text from a RAISE'd plpgsql exception surfaced by PostgREST.
export function guildError(error) {
  if (!error) return null
  return error.message || error.details || 'Something went wrong'
}
