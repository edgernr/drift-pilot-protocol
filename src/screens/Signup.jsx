import { useState } from 'react'
import './Signup.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { goto } = useNav()
  const { signup, loading, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [wallet, setWallet] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)
    clearError()
    if (password !== confirm) { setLocalError('Passwords do not match.'); return }
    const result = await signup(email, password, name.trim(), wallet.trim() || null)
    if (result === 'ok') goto('dashboard')
    if (result === 'confirm') setEmailSent(true)
  }

  const displayError = localError || error

  if (emailSent) {
    return (
      <div className="signup-wrap">
        <div className="signup-left">
          <div className="signup-logo">
            <img src="/LOGO.svg" alt="Drift Pilot Protocol" style={{ height: 28 }} />
          </div>
        </div>
        <div className="signup-right">
          <div className="panel panel-glow signup-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
            <h2>Check your inbox</h2>
            <p className="sub" style={{ marginBottom: 28 }}>
              We sent a confirmation link to <strong style={{ color: 'var(--ink-0)' }}>{email}</strong>.
              Click it to activate your account.
            </p>
            <button className="btn btn-ghost" onClick={() => goto('login')}>Back to login</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-wrap">
      <div className="signup-left">
        <div>
          <div className="signup-logo">
            <img src="/LOGO.svg" alt="Drift Pilot Protocol" style={{ height: 28 }} />
          </div>
          <div className="signup-hero">
            <span className="chip chip-violet" style={{ marginTop: 80, display: 'inline-flex' }}>
              <span className="dot dot-pulse" /> ENLISTING · SEASON 01
            </span>
            <h1>Welcome, pilot.<br /><span className="gradient-text">Let's suit up.</span></h1>
            <p>Create your account and start earning $DRIFT from day one.</p>
          </div>
        </div>
        <div className="signup-stats">
          <div><span className="n">142k</span><span className="s">active pilots</span></div>
          <div><span className="n gradient-text">2.4M</span><span className="s">$DRIFT earned</span></div>
          <div><span className="n">24/7</span><span className="s">raid matchmaking</span></div>
        </div>
      </div>

      <div className="signup-right">
        <div className="panel panel-glow signup-card">
          <span className="back-link" onClick={() => goto('landing')}>← back to home</span>
          <h2 style={{ marginTop: 24 }}>Create your account</h2>
          <p className="sub">Already a pilot? <span className="signup-login-link" onClick={() => goto('login')}>Log in →</span></p>

          {displayError && <div className="signup-error">{displayError}</div>}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-field">
              <label>Pilot name</label>
              <input
                type="text"
                placeholder="e.g. Axon"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="nickname"
                required
              />
            </div>
            <div className="signup-field">
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
            <div className="signup-field">
              <label>Wallet address <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="0x... or .sol address"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="signup-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="signup-field">
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Launch →'}
            </button>
          </form>

          <div className="signup-footer">
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
