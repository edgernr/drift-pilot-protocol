// Desktop (Electron) integration helpers. All no-ops on the web — `window.drift`
// is only defined by the Electron preload, so the web build behaves identically.

export const isDesktop = typeof window !== 'undefined' && !!window.drift

// Where Supabase should redirect auth emails (confirm / password reset).
// On desktop we use a deep link the OS routes back into the app; on web, the dashboard.
export function authRedirectTo() {
  if (isDesktop) return 'driftpilot://auth-callback'
  return `${window.location.origin}/dashboard`
}

// Apply a Supabase auth callback URL (from a deep link) to the client session.
// Handles both implicit (#access_token=…&refresh_token=…) and PKCE (?code=…) flows.
async function applyAuthUrl(supabase, rawUrl) {
  try {
    const url = new URL(rawUrl)
    const hash = new URLSearchParams((url.hash || '').replace(/^#/, ''))
    const access_token = hash.get('access_token')
    const refresh_token = hash.get('refresh_token')
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token })
      return true
    }
    const code = url.searchParams.get('code')
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
      return true
    }
  } catch { /* ignore malformed callback */ }
  return false
}

// Wire deep-link auth on desktop. Safe to call once on app mount; no-op on web.
export function initDesktopAuth(supabase) {
  if (!isDesktop) return () => {}
  // Handle a deep link that launched the app before we started listening.
  window.drift.getPendingDeepLink?.().then((url) => { if (url) applyAuthUrl(supabase, url) }).catch(() => {})
  // Handle deep links delivered while the app is running.
  return window.drift.onDeepLink?.((url) => applyAuthUrl(supabase, url)) ?? (() => {})
}

// Push the current streak to the OS tray (no-op on web).
export function setTrayStreak(streak) {
  if (isDesktop) window.drift.setStreak?.(streak)
}
