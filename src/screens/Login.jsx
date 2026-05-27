import { useState } from 'react'
import './Login.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { goto } = useNav()
  const { login, loading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    const ok = await login(email, password)
    if (ok) goto('dashboard')
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
        <div className="login-stats">
          <div><span className="n">12</span><span className="s">day avg streak</span></div>
          <div><span className="n gradient-text">#847</span><span className="s">your rank</span></div>
          <div><span className="n">4,820</span><span className="s">$DRIFT balance</span></div>
        </div>
      </div>

      <div className="login-right">
        <div className="panel panel-glow login-card">
          <span className="back-link" onClick={() => goto('landing')}>← back to home</span>
          <h2 style={{ marginTop: 24 }}>Log in</h2>
          <p className="sub">New pilot? <span className="link" onClick={() => goto('signup')}>Create an account →</span></p>

          {error && <div className="login-error">{error}</div>}

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
                <span className="login-forgot">Forgot?</span>
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
            By continuing you agree to the <a href="#">Flight Rules</a> &amp; <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div className="pilot-preview">
          <span className="dot" style={{ color: 'var(--lime)' }} />
          <span>3,214 pilots online now</span>
        </div>
      </div>
    </div>
  )
}
