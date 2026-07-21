import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Supabase Presence over a per-guild channel. Returns a Set of online user_ids.
//
// The raid system uses postgres_changes, not Presence, so this is the app's
// first Presence use. It follows the StrictMode timer contract (PROGRESS.md
// 2026-07-09): arm on EVERY effect run and let cleanup own teardown — never
// ref-guard the subscribe, or the dev double-mount leaves a dead channel.
//
// No-op (empty set) when guildId/userId is absent.
export function useGuildPresence(guildId, userId) {
  const [online, setOnline] = useState(() => new Set())

  useEffect(() => {
    if (!guildId || !userId) { setOnline(new Set()); return }

    const channel = supabase.channel(`guild:${guildId}`, {
      config: { presence: { key: userId } },
    })

    const sync = () => setOnline(new Set(Object.keys(channel.presenceState())))

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ user_id: userId, at: Date.now() })
      })

    return () => { supabase.removeChannel(channel) }
  }, [guildId, userId])

  return online
}
