import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — check .env.local')
}

// Realtime is throttled client-side as a cheap backstop against event storms:
// a burst of lobby writes can otherwise trigger a reload-per-event on every
// connected client. Server-side filters + debounced handlers do the real work;
// this is the seatbelt.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 2 } },
})
