// Client-side email hygiene for signup: friendly-message pre-checks that mirror
// the server. The server (Postgres normalize_email + the Session-2 "Before user
// created" hook) is the real enforcement; this is fast UX + a first wall.

import { supabase } from './supabase'

// Bundled starter blocklist — matches the seed in supabase/anti_abuse.sql so the
// client can reject the obvious ones instantly (the DB view is the source of
// truth once loaded; see loadBlockedDomains).
const SEED_DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'grr.la',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'tempmail.net', 'tempmailo.com', 'yopmail.com', 'yopmail.net',
  'trashmail.com', 'trashmail.net', 'sharklasers.com', 'getnada.com',
  'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'mohmal.com',
  'fakeinbox.com', 'throwawaymail.com', 'emailondeck.com', 'mintemail.com',
  'spamgourmet.com', 'mailcatch.com', 'inboxbear.com', 'tempinbox.com',
  'burnermail.io', '33mail.com', 'anonaddy.com', 'spam4.me',
  'temp-mail.io', 'minuteinbox.com', 'mailsac.com', 'vomoto.com',
  'discard.email', 'emltmp.com', 'luxusmail.org', 'mvrht.net',
  'mytemp.email', 'tmpmail.org', 'tmpmail.net', 'moakt.com',
  'easytrashmail.com', 'gettempmail.com',
])

let liveBlocklist = null

// Optionally refresh from the DB (admin-extended domains). Best-effort.
export async function loadBlockedDomains() {
  try {
    const { data } = await supabase.from('blocked_domains').select('domain')
    if (data?.length) liveBlocklist = new Set(data.map(r => r.domain.toLowerCase()))
  } catch { /* keep seed */ }
  return liveBlocklist ?? SEED_DISPOSABLE
}

export function emailDomain(email) {
  return (email || '').toLowerCase().trim().split('@')[1] || ''
}

export function isDisposableDomain(email) {
  const d = emailDomain(email)
  if (!d) return false
  return (liveBlocklist ?? SEED_DISPOSABLE).has(d)
}

// Normalize for the UI to warn about gmail aliasing (mirrors the SQL function).
export function normalizeEmail(email) {
  const e = (email || '').toLowerCase().trim()
  if (!e.includes('@')) return e
  let [local, domain] = e.split('@')
  local = local.split('+')[0]
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '')
    domain = 'gmail.com'
  }
  return `${local}@${domain}`
}

// Returns a friendly error string or null if the email passes the pre-check.
export function precheckEmail(email) {
  const e = (email || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address.'
  if (isDisposableDomain(e)) return 'Disposable / temporary email addresses are not allowed. Use a permanent inbox.'
  return null
}
