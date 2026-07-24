import { useState, useRef } from 'react'
import './Login.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Turnstile, { TURNSTILE_ENABLED } from '../components/Turnstile'

export default function Login() {
  const { goto } = useNav()
  const { login, loading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaErr, setCaptchaErr] = useState(null)
  const captchaRef = useRef(null)
  const [resetMsg, setResetMsg] = useState(null)
  const [banMsg] = useState(() => {
    const v = localStorage.getItem('hp_ban_until')
    if (!v) return null
    if (v === '2099-01-01T00:00:00Z') return 'Your account has been permanently suspended.'
    const d = new Date(v)
    if (d > new Date()) return `Account suspended until ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    localStorage.removeItem('hp_ban_until')
    return null
  })

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    setCaptchaErr(null)
    if (TURNSTILE_ENABLED && !captchaToken) { setCaptchaErr('Please complete the verification challenge.'); return }
    const ok = await login(email, password, captchaToken || undefined)
    captchaRef.current?.reset(); setCaptchaToken('') // token is single-use
    if (ok) goto('dashboard')
  }

  async function handleForgot() {
    if (!email.trim()) { setResetMsg('Enter your email above first, then tap Forgot.'); return }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    })
    setResetMsg(resetError ? resetError.message : 'Reset link sent — check your inbox.')
  }

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="auth-brand">
          <span className="auth-mark" />
          Void Shards
        </div>

        <div className="login-hero">
          <span className="auth-eyebrow">// Re-entering the system</span>
          <h1>
            Welcome back,<br />
            <span className="tint-cyan">Seeker.</span>
          </h1>
          <p>Log in to resume your missions, claim your streak rewards, and push your rank up the ladder.</p>
        </div>

        <div className="auth-status">
          <span className="pulse" />
          Season 01 · The Abyss is live
        </div>
      </div>

      <div className="login-right">
        <div className="auth-card">
          <div className="auth-br tl" /><div className="auth-br tr" />
          <div className="auth-br bl" /><div className="auth-br br2" />

          <button className="auth-back" onClick={() => goto('landing')}>← back to home</button>
          <h2>Log in</h2>
          <p className="sub">New seeker? <span className="link" onClick={() => goto('signup')}>Create an account →</span></p>

          {banMsg && <div className="auth-ban">🚫 {banMsg}</div>}
          {error && !resetMsg && <div className="auth-error">{error}</div>}
          {resetMsg && <div className="auth-msg">{resetMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="seeker@voidshards.net"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="auth-field">
              <label>
                Password
                <button type="button" className="auth-forgot" onClick={handleForgot}>Forgot?</button>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Turnstile ref={captchaRef} onVerify={setCaptchaToken} />
            {captchaErr && <div className="auth-error">{captchaErr}</div>}
            <button type="submit" className="auth-btn-gold" disabled={loading}>
              {loading ? 'Logging in…' : 'Enter the void →'}
            </button>
          </form>

          <div className="auth-footer">
            By continuing you agree to the{' '}
            <span className="link" onClick={() => goto('terms')}>Terms</span>
            {' '}&amp;{' '}
            <span className="link" onClick={() => goto('privacy')}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
