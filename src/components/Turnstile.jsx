import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Cloudflare Turnstile — invisible/managed CAPTCHA wall for signup + login.
//
// Inert by default: renders NOTHING and issues no token unless
// VITE_TURNSTILE_SITE_KEY is set. So it never breaks current auth. To turn it on:
//   1. Cloudflare → Turnstile → create a widget → copy the SITE key.
//   2. Set VITE_TURNSTILE_SITE_KEY in the build env (Vercel) and redeploy.
//   3. Supabase → Auth → Attack Protection → enable CAPTCHA (Turnstile) + paste
//      the SECRET key. (Client sends the token; Supabase verifies it.)
// Then signup/login require a valid token automatically.

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export const TURNSTILE_ENABLED = !!SITE_KEY

let scriptPromise = null
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => res()
    s.onerror = rej
    document.head.appendChild(s)
  })
  return scriptPromise
}

// onVerify(token) fires with the token on success, '' on expire/error.
// Parent calls ref.current.reset() after each submit (tokens are single-use).
const Turnstile = forwardRef(function Turnstile({ onVerify }, ref) {
  const boxRef = useRef(null)
  const widgetId = useRef(null)
  const cbRef = useRef(onVerify)
  useEffect(() => { cbRef.current = onVerify })

  useImperativeHandle(ref, () => ({
    reset() { try { window.turnstile?.reset(widgetId.current) } catch { /* not ready */ } },
    configured: TURNSTILE_ENABLED,
  }), [])

  useEffect(() => {
    if (!SITE_KEY) return undefined
    let cancelled = false
    loadScript().then(() => {
      if (cancelled || !boxRef.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (token) => cbRef.current?.(token),
        'expired-callback': () => cbRef.current?.(''),
        'error-callback': () => cbRef.current?.(''),
      })
    }).catch(() => {})
    return () => { cancelled = true; try { window.turnstile?.remove(widgetId.current) } catch { /* gone */ } }
  }, [])

  if (!SITE_KEY) return null
  return <div ref={boxRef} className="cf-turnstile-box" style={{ margin: '4px 0 14px' }} />
})

export default Turnstile
