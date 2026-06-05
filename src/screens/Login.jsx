import { useState } from 'react'
import './Login.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { goto } = useNav()
  const { login, loading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetMsg, setResetMsg] = useState(null)
  const [banMsg, setBanMsg] = useState(() => {
    const v = localStorage.getItem('dpp_ban_until')
    if (!v) return null
    if (v === '2099-01-01T00:00:00Z') return 'Your account has been permanently suspended.'
    const d = new Date(v)
    if (d > new Date()) return `Your account is suspended until ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    localStorage.removeItem('dpp_ban_until')
    return null
  })

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    const ok = await login(email, password)
    if (ok) goto('dashboard')
  }

  async function handleForgot() {
    if (!email.trim()) {
      setResetMsg('Enter your email above first, then tap Forgot.')
      return
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    })
    setResetMsg(resetError ? resetError.message : 'Reset link sent — check your inbox.')
  }

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div>
          <div className="login-logo">
            <img src="/LOGO.svg" alt="Drift Pilot Protocol" style={{ height: 28 }} />
          </div>
          <div className="login-hero">
            <span className="chip chip-teal" style={{ marginTop: 80, display: 'inline-flex' }}>
              <span className="dot dot-pulse" /> SEASON 01 · LIVE
            </span>
            <h1>Welcome back,<br /><span className="gradient-text">pilot.</span></h1>
            <p>Log in to resume your missions, claim your streak rewards, and push your rank up the leaderboard.</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="panel panel-glow login-card">
          <span className="back-link" onClick={() => goto('landing')}>← back to home</span>
          <h2 style={{ marginTop: 24 }}>Log in</h2>
          <p className="sub">New pilot? <span className="link" onClick={() => goto('signup')}>Create an account →</span></p>

          {banMsg && (
            <div className="login-ban">
              <div style={{ fontSize: 16, marginBottom: 6 }}>🚫</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Access Suspended</div>
              <div style={{ opacity: 0.8 }}>{banMsg}</div>
            </div>
          )}
          {error && <div className="login-error">{error}</div>}
          {resetMsg && (
            <div className="login-error" style={{ color: 'var(--teal)', borderColor: 'var(--teal)', background: 'transparent' }}>
              {resetMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="pilot@driftpilotprotocol.xyz"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="login-field">
              <label>
                Password
                <span className="login-forgot" role="button" tabIndex={0} onClick={handleForgot}>Forgot?</span>
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Logging in…' : 'Launch →'}
            </button>
          </form>

          <div className="login-footer">
            By continuing you agree to the <span className="link" style={{ color: 'var(--teal)', cursor: 'pointer' }} onClick={() => goto('terms')}>Flight Rules</span> &amp; <span className="link" style={{ color: 'var(--teal)', cursor: 'pointer' }} onClick={() => goto('privacy')}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
