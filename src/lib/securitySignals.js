// Client → server telemetry for anti-abuse. All calls are best-effort and
// silent (never block or break auth). Server-side log_security_event() reads the
// real client IP from the request context and salts/hashes IP + email.

import { supabase } from './supabase'
import { getFingerprint, shortUA } from './fingerprint'

// Opt-in: telemetry only fires when the backend is ready. Off by default so a
// project without the log_security_event RPC never logs a 404 on login/session.
// Enable: run the RPC in supabase/anti_abuse.sql, then set
// VITE_SECURITY_TELEMETRY=true in the build env and redeploy.
const TELEMETRY_ENABLED = import.meta.env.VITE_SECURITY_TELEMETRY === 'true'
let disabled = false // circuit-breaker: stop after a hard failure (e.g. RPC missing)

// kind: 'signup' | 'login' | 'session' | 'bot'
export async function logSecurityEvent(kind, { email = null, botScore = 0, signals = {} } = {}) {
  if (!TELEMETRY_ENABLED || disabled) return
  try {
    const { error } = await supabase.rpc('log_security_event', {
      p_kind: kind,
      p_fingerprint: getFingerprint(),
      p_email: email,
      p_bot_score: botScore,
      p_signals: signals,
      p_user_agent: shortUA(),
    })
    if (error) disabled = true // missing RPC / not set up → don't retry this session
  } catch { disabled = true } // telemetry must never break auth
}

// Lightweight behavioral bot-signal collector for an auth form. Tracks: time to
// submit, whether the human interacted (mouse/keys/focus), and a honeypot field.
export function createBotProbe() {
  const startedAt = Date.now()
  let interactions = 0
  const bump = () => { interactions++ }
  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', bump, { once: true })
    window.addEventListener('keydown', bump, { passive: true })
    window.addEventListener('focusin', bump, { passive: true })
  }
  return {
    // honeypot: pass the hidden field's value at submit time (bots fill it).
    evaluate(honeypotValue) {
      const msToSubmit = Date.now() - startedAt
      const signals = {
        ms_to_submit: msToSubmit,
        interactions,
        honeypot: !!honeypotValue,
      }
      // Score: honeypot = certain bot. Fast+no-interaction = strong suspicion.
      let botScore = 0
      if (honeypotValue) botScore = 100
      else {
        if (msToSubmit < 1200) botScore += 45
        if (interactions === 0) botScore += 45
      }
      return { botScore: Math.min(100, botScore), signals, hardBlock: !!honeypotValue }
    },
    dispose() {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', bump)
        window.removeEventListener('focusin', bump)
      }
    },
  }
}

// Inline style for the honeypot input — visually hidden, not display:none (some
// bots skip display:none), off-screen, aria-hidden, no tab stop.
export const HONEYPOT_STYLE = {
  position: 'absolute',
  left: '-9999px',
  top: 0,
  width: '1px',
  height: '1px',
  opacity: 0,
  pointerEvents: 'none',
}
