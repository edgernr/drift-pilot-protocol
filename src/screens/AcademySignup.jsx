import { useState } from 'react'
import './Signup.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AcademySignup() {
  const { goto } = useNav()
  const { loading, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)
    clearError()
    if (password !== confirm) { setLocalError('Passwords do not match.'); return }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim(), wallet: null },
        emailRedirectTo: `${window.location.origin}/academy/onboarding`,
      },
    })

    if (signupError) { setLocalError(signupError.message); return }

    if (data.session) {
      goto('academy/onboarding')
    } else {
      setEmailSent(true)
    }
  }

  const displayError = localError || error

  if (emailSent) {
    return (
      <div className="signup-wrap">
        <div className="signup-left">
          <div className="signup-logo">
            <img src="/LOGO.svg" alt="Drift Builders Academy" style={{ height: 28 }} />
          </div>
        </div>
        <div className="signup-right">
          <div className="panel panel-glow signup-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
            <h2>Check your inbox</h2>
            <p className="sub" style={{ marginBottom: 28 }}>
              We sent a confirmation link to <strong style={{ color: 'var(--ink-0)' }}>{email}</strong>.
              Click it to enter the Construct.
            </p>
            <button className="btn btn-ghost" onClick={() => goto('academy')}>← Back to Academy</button>
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
            <img src="/LOGO.svg" alt="Drift Builders Academy" style={{ height: 28 }} />
          </div>
          <div className="signup-hero">
            <span className="chip chip-violet" style={{ marginTop: 80, display: 'inline-flex' }}>
              <span className="dot dot-pulse" /> DRIFT BUILDERS ACADEMY
            </span>
            <h1>Welcome, Builder.<br /><span className="gradient-text">Let's get started.</span></h1>
            <p>Create a parent account to set up your child's Builder profile.</p>
          </div>
        </div>
        <div className="signup-stats">
          <div><span className="n">3 tracks</span><span className="s">Scratch · Python · JS</span></div>
          <div><span className="n gradient-text">61</span><span className="s">Academy gates</span></div>
          <div><span className="n">Ages 8–16</span><span className="s">no token economy</span></div>
        </div>
      </div>

      <div className="signup-right">
        <div className="panel panel-glow signup-card">
          <span className="back-link" onClick={() => goto('academy')}>← back to Academy</span>
          <h2 style={{ marginTop: 24 }}>Create parent account</h2>
          <p className="sub">Already have an account? <span className="signup-login-link" onClick={() => goto('login')}>Log in →</span></p>

          {displayError && <div className="signup-error">{displayError}</div>}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-field">
              <label>Your name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="signup-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="parent@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
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
              {loading ? 'Creating account…' : 'Enter the Construct →'}
            </button>
          </form>

          <div className="signup-footer">
            By continuing you agree to the <a href="#">Academy Terms</a> &amp; <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}
